import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Conversation, generateSampleConversations, formatTime } from '@/lib/social-data';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  useEffect(() => {
    setConversations(generateSampleConversations());
  }, []);

  function openChat(conv: Conversation) {
    Haptics.selectionAsync();
    router.push({
      pathname: '/chat/[id]',
      params: {
        id: conv.user.id,
        username: conv.user.username,
        displayName: conv.user.displayName,
        avatar: conv.user.avatar,
        online: conv.user.online ? 'true' : 'false',
      },
    });
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 8 }]}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Pressable hitSlop={8}>
          <Ionicons name="create-outline" size={24} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={item => item.user.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.chatItem, pressed && { opacity: 0.7 }]}
            onPress={() => openChat(item)}
          >
            <View style={styles.chatAvatarContainer}>
              <Image source={{ uri: item.user.avatar }} style={styles.chatAvatar} />
              {item.user.online && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.chatInfo}>
              <View style={styles.chatTopRow}>
                <Text style={[styles.chatName, item.unreadCount > 0 && styles.chatNameBold]}>
                  {item.user.displayName}
                </Text>
                <Text style={[styles.chatTime, item.unreadCount > 0 && styles.chatTimeBold]}>
                  {formatTime(item.lastMessageTime)}
                </Text>
              </View>
              <View style={styles.chatBottomRow}>
                <Text
                  style={[styles.chatMessage, item.unreadCount > 0 && styles.chatMessageBold]}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>
                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.dark.textMuted} />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>Start a conversation with someone</Text>
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.dark.border,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    letterSpacing: -0.5,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  chatAvatarContainer: {
    position: 'relative',
  },
  chatAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.surface,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.dark.online,
    borderWidth: 2.5,
    borderColor: '#000',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 14,
    gap: 4,
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#fff',
  },
  chatNameBold: {
    fontFamily: 'Inter_700Bold',
  },
  chatTime: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  chatTimeBold: {
    color: Colors.dark.accent,
  },
  chatBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
    flex: 1,
    marginRight: 8,
  },
  chatMessageBold: {
    color: Colors.dark.textSecondary,
    fontFamily: 'Inter_500Medium',
  },
  unreadBadge: {
    backgroundColor: Colors.dark.accent,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.textSecondary,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
});
