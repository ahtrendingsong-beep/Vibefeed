import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/auth-context';
import { Message, loadMessages, saveMessages } from '@/lib/social-data';

const AUTO_REPLIES = [
  "That's awesome! Tell me more",
  "Haha, totally agree!",
  "Nice one!",
  "I was just thinking the same thing",
  "Let's definitely do that!",
  "Sounds great to me",
  "No way! That's incredible",
  "I love that idea",
];

export default function ChatDetailScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { id, username, displayName, avatar, online } = useLocalSearchParams<{
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    online: string;
  }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const isOnline = online === 'true';

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  useEffect(() => {
    async function load() {
      const stored = await loadMessages(id!);
      if (stored.length > 0) {
        setMessages(stored);
      } else {
        const initial: Message[] = [
          {
            id: Date.now().toString() + '_1',
            senderId: id!,
            receiverId: user?.id || '',
            text: `Hey! Great to connect with you here!`,
            timestamp: Date.now() - 60000,
            read: true,
          },
        ];
        setMessages(initial);
      }
    }
    load();
  }, [id]);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || !user) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newMsg: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      senderId: user.id,
      receiverId: id!,
      text: inputText.trim(),
      timestamp: Date.now(),
      read: false,
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputText('');
    await saveMessages(id!, updatedMessages);

    setTimeout(async () => {
      const reply: Message = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        senderId: id!,
        receiverId: user.id,
        text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        timestamp: Date.now(),
        read: false,
      };
      const withReply = [...updatedMessages, reply];
      setMessages(withReply);
      await saveMessages(id!, withReply);
    }, 1500 + Math.random() * 2000);
  }, [inputText, messages, user, id]);

  function formatMsgTime(timestamp: number): string {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function renderMessage({ item }: { item: Message }) {
    const isMine = item.senderId === user?.id;
    return (
      <View style={[styles.msgRow, isMine ? styles.msgRowMine : styles.msgRowTheirs]}>
        {!isMine && (
          <Image source={{ uri: avatar }} style={styles.msgAvatar} />
        )}
        <View style={[styles.msgBubble, isMine ? styles.msgBubbleMine : styles.msgBubbleTheirs]}>
          <Text style={[styles.msgText, isMine ? styles.msgTextMine : styles.msgTextTheirs]}>
            {item.text}
          </Text>
          <Text style={[styles.msgTime, isMine ? styles.msgTimeMine : styles.msgTimeTheirs]}>
            {formatMsgTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 4 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatarWrap}>
            <Image source={{ uri: avatar }} style={styles.headerAvatar} />
            {isOnline && <View style={styles.headerOnline} />}
          </View>
          <View>
            <Text style={styles.headerName}>{displayName}</Text>
            <Text style={styles.headerStatus}>
              {isOnline ? 'Active now' : 'Offline'}
            </Text>
          </View>
        </View>
        <Pressable hitSlop={8}>
          <Ionicons name="call-outline" size={24} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        inverted={false}
      />

      <View style={[styles.inputBar, { paddingBottom: Platform.OS === 'web' ? 34 : Math.max(insets.bottom, 12) }]}>
        <View style={styles.inputWrapper}>
          <Pressable hitSlop={8}>
            <Ionicons name="camera-outline" size={24} color={Colors.dark.textMuted} />
          </Pressable>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Message..."
            placeholderTextColor={Colors.dark.textMuted}
            multiline
            maxLength={500}
          />
          {inputText.trim() ? (
            <Pressable onPress={sendMessage} hitSlop={8}>
              <Ionicons name="send" size={22} color={Colors.dark.accent} />
            </Pressable>
          ) : (
            <View style={styles.inputActions}>
              <Pressable hitSlop={8}>
                <Ionicons name="mic-outline" size={24} color={Colors.dark.textMuted} />
              </Pressable>
              <Pressable hitSlop={8}>
                <Ionicons name="image-outline" size={24} color={Colors.dark.textMuted} />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.dark.border,
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatarWrap: {
    position: 'relative',
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  headerOnline: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.dark.online,
    borderWidth: 2,
    borderColor: '#000',
  },
  headerName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  headerStatus: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 6,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  msgRowMine: {
    justifyContent: 'flex-end',
  },
  msgRowTheirs: {
    justifyContent: 'flex-start',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 2,
  },
  msgBubble: {
    maxWidth: '72%',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  msgBubbleMine: {
    backgroundColor: Colors.dark.accent,
    borderBottomRightRadius: 6,
  },
  msgBubbleTheirs: {
    backgroundColor: Colors.dark.messageReceived,
    borderBottomLeftRadius: 6,
  },
  msgText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 21,
  },
  msgTextMine: {
    color: '#fff',
  },
  msgTextTheirs: {
    color: '#fff',
  },
  msgTime: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  msgTimeMine: {
    color: 'rgba(255,255,255,0.6)',
  },
  msgTimeTheirs: {
    color: Colors.dark.textMuted,
  },
  inputBar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: Colors.dark.border,
    backgroundColor: '#000',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surfaceLight,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    maxHeight: 80,
    paddingVertical: 0,
  },
  inputActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
