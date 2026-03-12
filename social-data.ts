import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: Comment[];
  liked: boolean;
  timestamp: number;
}

export interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: number;
}

export interface Reel {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  videoUrl: string;
  thumbnailColor: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  musicName: string;
}

export interface ChatUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  online: boolean;
  lastSeen: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface Conversation {
  user: ChatUser;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

const POSTS_KEY = '@vibe_posts';
const MESSAGES_KEY = '@vibe_messages';

const SAMPLE_USERS: ChatUser[] = [
  { id: 'u1', username: 'alex_travels', displayName: 'Alex', avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=alex', online: true, lastSeen: 'now' },
  { id: 'u2', username: 'sarah_creates', displayName: 'Sarah', avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=sarah', online: false, lastSeen: '2h ago' },
  { id: 'u3', username: 'mike_photo', displayName: 'Mike', avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=mike', online: true, lastSeen: 'now' },
  { id: 'u4', username: 'emma_design', displayName: 'Emma', avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=emma', online: false, lastSeen: '30m ago' },
  { id: 'u5', username: 'james_code', displayName: 'James', avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=james', online: true, lastSeen: 'now' },
  { id: 'u6', username: 'lily_art', displayName: 'Lily', avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=lily', online: false, lastSeen: '1h ago' },
];

const IMAGE_URLS = [
  'https://picsum.photos/seed/post1/600/600',
  'https://picsum.photos/seed/post2/600/600',
  'https://picsum.photos/seed/post3/600/600',
  'https://picsum.photos/seed/post4/600/600',
  'https://picsum.photos/seed/post5/600/600',
  'https://picsum.photos/seed/post6/600/600',
  'https://picsum.photos/seed/post7/600/600',
  'https://picsum.photos/seed/post8/600/600',
  'https://picsum.photos/seed/post9/600/600',
  'https://picsum.photos/seed/post10/600/600',
  'https://picsum.photos/seed/post11/600/600',
  'https://picsum.photos/seed/post12/600/600',
];

const CAPTIONS = [
  'Living my best life',
  'Golden hour magic',
  'Adventures await',
  'Perfect vibes today',
  'Making memories',
  'Chasing sunsets',
  'Stay wild, stay free',
  'Life is beautiful',
  'Exploring new places',
  'Good times only',
  'Weekend mood',
  'Feeling grateful',
];

const REEL_COLORS = [
  '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#e94560', '#2d4059', '#ea5455', '#f07b3f',
  '#345b63', '#152d35', '#d4a373', '#606c38',
];

const MUSIC_NAMES = [
  'Midnight Dreams - Luna',
  'Neon Lights - The Waves',
  'Summer Breeze - Coast',
  'Electric Feel - Pulse',
  'Starlight - Nova',
  'Ocean Drive - Sunset',
  'City Nights - Metro',
  'Wildfire - Blaze',
];

export function generateSamplePosts(): Post[] {
  return SAMPLE_USERS.flatMap((user, userIdx) =>
    [0, 1].map((postIdx) => {
      const idx = userIdx * 2 + postIdx;
      return {
        id: `post_${idx}`,
        userId: user.id,
        username: user.username,
        userAvatar: user.avatar,
        imageUrl: IMAGE_URLS[idx % IMAGE_URLS.length],
        caption: CAPTIONS[idx % CAPTIONS.length],
        likes: Math.floor(Math.random() * 5000) + 100,
        comments: [
          { id: `c${idx}_1`, username: SAMPLE_USERS[(userIdx + 1) % SAMPLE_USERS.length].username, text: 'Amazing!', timestamp: Date.now() - 3600000 },
          { id: `c${idx}_2`, username: SAMPLE_USERS[(userIdx + 2) % SAMPLE_USERS.length].username, text: 'Love this!', timestamp: Date.now() - 1800000 },
        ],
        liked: false,
        timestamp: Date.now() - idx * 3600000,
      };
    })
  );
}

export function generateSampleReels(): Reel[] {
  return SAMPLE_USERS.map((user, idx) => ({
    id: `reel_${idx}`,
    userId: user.id,
    username: user.username,
    userAvatar: user.avatar,
    videoUrl: '',
    thumbnailColor: REEL_COLORS[idx % REEL_COLORS.length],
    caption: CAPTIONS[idx % CAPTIONS.length],
    likes: Math.floor(Math.random() * 50000) + 1000,
    comments: Math.floor(Math.random() * 5000) + 100,
    shares: Math.floor(Math.random() * 1000) + 50,
    liked: false,
    musicName: MUSIC_NAMES[idx % MUSIC_NAMES.length],
  }));
}

export function getSampleUsers(): ChatUser[] {
  return SAMPLE_USERS;
}

export function generateSampleConversations(): Conversation[] {
  const messages = [
    'Hey! How are you?',
    'Check out my new post!',
    'Let\'s meet up this weekend',
    'That photo is incredible',
    'Thanks for the follow!',
    'Miss you! Let\'s catch up soon',
  ];
  return SAMPLE_USERS.map((user, idx) => ({
    user,
    lastMessage: messages[idx % messages.length],
    lastMessageTime: Date.now() - idx * 1800000,
    unreadCount: idx < 3 ? Math.floor(Math.random() * 5) + 1 : 0,
  }));
}

export async function savePosts(posts: Post[]) {
  await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export async function loadPosts(): Promise<Post[] | null> {
  const stored = await AsyncStorage.getItem(POSTS_KEY);
  return stored ? JSON.parse(stored) : null;
}

export async function saveMessages(chatId: string, messages: Message[]) {
  await AsyncStorage.setItem(`${MESSAGES_KEY}_${chatId}`, JSON.stringify(messages));
}

export async function loadMessages(chatId: string): Promise<Message[]> {
  const stored = await AsyncStorage.getItem(`${MESSAGES_KEY}_${chatId}`);
  return stored ? JSON.parse(stored) : [];
}

export function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString();
}

export function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
