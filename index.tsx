import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/auth-context';
import { Post, generateSamplePosts, formatTime, formatCount } from '@/lib/social-data';

const { width } = Dimensions.get('window');

function PostItem({ post, onLike }: { post: Post; onLike: (id: string) => void }) {
  const heartScale = useSharedValue(1);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  function handleLike() {
    heartScale.value = withSequence(
      withSpring(1.3, { damping: 2, stiffness: 400 }),
      withSpring(1, { damping: 8, stiffness: 300 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLike(post.id);
  }

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.postUserInfo}>
          <View style={styles.avatarRing}>
            <Image source={{ uri: post.userAvatar }} style={styles.postAvatar} />
          </View>
          <Text style={styles.postUsername}>{post.username}</Text>
        </View>
        <Pressable hitSlop={12}>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.dark.textSecondary} />
        </Pressable>
      </View>

      <Image
        source={{ uri: post.imageUrl }}
        style={styles.postImage}
        contentFit="cover"
        transition={200}
      />

      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <Pressable onPress={handleLike} hitSlop={8}>
            <Animated.View style={heartStyle}>
              <Ionicons
                name={post.liked ? "heart" : "heart-outline"}
                size={26}
                color={post.liked ? Colors.dark.like : "#fff"}
              />
            </Animated.View>
          </Pressable>
          <Pressable hitSlop={8}>
            <Ionicons name="chatbubble-outline" size={24} color="#fff" />
          </Pressable>
          <Pressable hitSlop={8}>
            <Ionicons name="paper-plane-outline" size={24} color="#fff" />
          </Pressable>
        </View>
        <Pressable hitSlop={8}>
          <Ionicons name="bookmark-outline" size={24} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.postInfo}>
        <Text style={styles.likesText}>{formatCount(post.likes + (post.liked ? 1 : 0))} likes</Text>
        <Text style={styles.captionText}>
          <Text style={styles.captionUsername}>{post.username}</Text>{'  '}{post.caption}
        </Text>
        {post.comments.length > 0 && (
          <Text style={styles.commentsLink}>
            View all {post.comments.length} comments
          </Text>
        )}
        <Text style={styles.timeText}>{formatTime(post.timestamp)}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  useEffect(() => {
    setPosts(generateSamplePosts());
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      setPosts(generateSamplePosts());
      setRefreshing(false);
    }, 1000);
  }, []);

  function handleLike(postId: string) {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, liked: !p.liked } : p
    ));
  }

  function renderHeader() {
    return (
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 8 }]}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={Colors.dark.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerLogoGradient}
          >
            <Ionicons name="camera" size={18} color="#fff" />
          </LinearGradient>
          <Text style={styles.headerTitle}>Vibe</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable hitSlop={8}>
            <Ionicons name="heart-outline" size={26} color="#fff" />
          </Pressable>
          <Pressable hitSlop={8}>
            <Ionicons name="paper-plane-outline" size={26} color="#fff" />
          </Pressable>
        </View>
      </View>
    );
  }

  function renderStories() {
    const storyUsers = [
      { id: 'you', username: 'Your story', avatar: user?.avatar || '' },
      ...generateSamplePosts().slice(0, 6).map(p => ({ id: p.userId, username: p.username, avatar: p.userAvatar })),
    ];
    const unique = storyUsers.filter((u, i, arr) => arr.findIndex(a => a.id === u.id) === i);

    return (
      <View style={styles.storiesContainer}>
        <FlatList
          horizontal
          data={unique}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesList}
          renderItem={({ item, index }) => (
            <Pressable style={styles.storyItem}>
              <LinearGradient
                colors={index === 0 ? ['#444', '#666'] : Colors.dark.gradient}
                style={styles.storyGradient}
              >
                <Image source={{ uri: item.avatar }} style={styles.storyAvatar} />
              </LinearGradient>
              <Text style={styles.storyUsername} numberOfLines={1}>
                {index === 0 ? 'You' : item.username.split('_')[0]}
              </Text>
              {index === 0 && (
                <View style={styles.storyAddBtn}>
                  <Ionicons name="add" size={14} color="#fff" />
                </View>
              )}
            </Pressable>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        ListHeaderComponent={() => (
          <>
            {renderHeader()}
            {renderStories()}
          </>
        )}
        renderItem={({ item }) => <PostItem post={item} onLike={handleLike} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.accent} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoGradient: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 20,
  },
  storiesContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.dark.border,
    paddingBottom: 12,
  },
  storiesList: {
    paddingHorizontal: 12,
    gap: 14,
  },
  storyItem: {
    alignItems: 'center',
    width: 68,
  },
  storyGradient: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#000',
  },
  storyUsername: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  storyAddBtn: {
    position: 'absolute',
    bottom: 18,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  postContainer: {
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  postUsername: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  postImage: {
    width: width,
    height: width,
    backgroundColor: Colors.dark.surface,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  postActionsLeft: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  postInfo: {
    paddingHorizontal: 14,
    gap: 4,
    paddingBottom: 8,
  },
  likesText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  captionText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#fff',
    lineHeight: 20,
  },
  captionUsername: {
    fontFamily: 'Inter_600SemiBold',
  },
  commentsLink: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
});
