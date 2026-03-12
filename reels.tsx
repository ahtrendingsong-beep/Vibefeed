import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
  ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Reel, generateSampleReels, formatCount } from '@/lib/social-data';

const { width, height } = Dimensions.get('window');

function ReelActionButton({ icon, count, active, activeColor, onPress }: {
  icon: string;
  count: string;
  active?: boolean;
  activeColor?: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    scale.value = withSequence(
      withSpring(1.3, { damping: 2, stiffness: 400 }),
      withSpring(1, { damping: 8, stiffness: 300 })
    );
    onPress();
  }

  return (
    <Pressable onPress={handlePress} style={styles.actionButton}>
      <Animated.View style={animStyle}>
        <Ionicons
          name={icon as any}
          size={28}
          color={active ? (activeColor || Colors.dark.like) : '#fff'}
        />
      </Animated.View>
      <Text style={styles.actionCount}>{count}</Text>
    </Pressable>
  );
}

function MusicDisc({ musicName }: { musicName: string }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const discStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.musicContainer}>
      <Ionicons name="musical-note" size={14} color="#fff" />
      <Text style={styles.musicText} numberOfLines={1}>{musicName}</Text>
      <Animated.View style={[styles.musicDisc, discStyle]}>
        <LinearGradient
          colors={Colors.dark.gradient}
          style={styles.musicDiscInner}
        >
          <View style={styles.musicDiscCenter} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function ReelItem({ reel, isActive, onLike }: { reel: Reel; isActive: boolean; onLike: (id: string) => void }) {
  return (
    <View style={[styles.reelContainer, { height: height }]}>
      <LinearGradient
        colors={[reel.thumbnailColor, '#000', reel.thumbnailColor + '80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.reelContent}>
        <View style={styles.reelCenter}>
          <Ionicons name="play-circle" size={64} color="rgba(255,255,255,0.3)" />
        </View>
      </View>

      <View style={styles.reelOverlay}>
        <View style={styles.reelBottom}>
          <View style={styles.reelInfo}>
            <View style={styles.reelUser}>
              <Image source={{ uri: reel.userAvatar }} style={styles.reelAvatar} />
              <Text style={styles.reelUsername}>{reel.username}</Text>
              <Pressable style={styles.followBtn}>
                <Text style={styles.followBtnText}>Follow</Text>
              </Pressable>
            </View>
            <Text style={styles.reelCaption} numberOfLines={2}>{reel.caption}</Text>
            <MusicDisc musicName={reel.musicName} />
          </View>

          <View style={styles.reelActions}>
            <ReelActionButton
              icon={reel.liked ? "heart" : "heart-outline"}
              count={formatCount(reel.likes)}
              active={reel.liked}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onLike(reel.id);
              }}
            />
            <ReelActionButton
              icon="chatbubble-outline"
              count={formatCount(reel.comments)}
              onPress={() => Haptics.selectionAsync()}
            />
            <ReelActionButton
              icon="paper-plane-outline"
              count={formatCount(reel.shares)}
              onPress={() => Haptics.selectionAsync()}
            />
            <Pressable style={styles.actionButton}>
              <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function ReelsScreen() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setReels(generateSampleReels());
  }, []);

  function handleLike(reelId: string) {
    setReels(prev => prev.map(r =>
      r.id === reelId ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r
    ));
  }

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
      Haptics.selectionAsync();
    }
  }, []);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View style={styles.container}>
      <FlatList
        data={reels}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={height}
        renderItem={({ item, index }) => (
          <ReelItem
            reel={item}
            isActive={index === activeIndex}
            onLike={handleLike}
          />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <View style={[styles.reelsHeader, { top: Platform.OS === 'web' ? 67 : 50 }]}>
        <Text style={styles.reelsHeaderTitle}>Reels</Text>
        <Pressable hitSlop={8}>
          <Ionicons name="camera-outline" size={26} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  reelContainer: {
    width: width,
    position: 'relative',
  },
  reelContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  reelBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 120,
    paddingHorizontal: 16,
    gap: 12,
  },
  reelInfo: {
    flex: 1,
    gap: 10,
  },
  reelUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reelAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
  },
  reelUsername: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  followBtn: {
    borderWidth: 1.5,
    borderColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  followBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  reelCaption: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#fff',
    lineHeight: 20,
  },
  musicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  musicText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#fff',
    flex: 1,
  },
  musicDisc: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  musicDiscInner: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicDiscCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
  },
  reelActions: {
    alignItems: 'center',
    gap: 18,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  reelsHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  reelsHeaderTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
});
