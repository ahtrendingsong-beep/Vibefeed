import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/auth-context';
import { formatCount } from '@/lib/social-data';

const { width } = Dimensions.get('window');
const GRID_SIZE = (width - 4) / 3;

const USER_POSTS = Array.from({ length: 9 }, (_, i) => ({
  id: `my_post_${i}`,
  imageUrl: `https://picsum.photos/seed/mypost${i}/400/400`,
}));

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'grid' | 'tagged'>('grid');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editDisplayName, setEditDisplayName] = useState(user?.displayName || '');

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleLogout = useCallback(() => {
    if (Platform.OS === 'web') {
      logout();
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout },
      ]);
    }
  }, [logout]);

  function handleSaveProfile() {
    updateProfile({ bio: editBio, displayName: editDisplayName });
    setShowEditModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  if (!user) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={[styles.header, { paddingTop: insets.top + webTopInset + 8 }]}>
          <Text style={styles.headerUsername}>{user.username}</Text>
          <View style={styles.headerIcons}>
            <Pressable hitSlop={8}>
              <Ionicons name="add-circle-outline" size={26} color="#fff" />
            </Pressable>
            <Pressable onPress={handleLogout} hitSlop={8}>
              <Ionicons name="menu-outline" size={28} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={Colors.dark.gradient}
              style={styles.avatarGradient}
            >
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            </LinearGradient>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{USER_POSTS.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatCount(user.followersCount)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatCount(user.followingCount)}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        <View style={styles.bioSection}>
          <Text style={styles.displayName}>{user.displayName}</Text>
          {!!user.bio && <Text style={styles.bioText}>{user.bio}</Text>}
        </View>

        <View style={styles.actionButtons}>
          <Pressable
            style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.7 }]}
            onPress={() => {
              setEditBio(user.bio);
              setEditDisplayName(user.displayName);
              setShowEditModal(true);
              Haptics.selectionAsync();
            }}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.editBtnText}>Share Profile</Text>
          </Pressable>
        </View>

        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tabItem, activeTab === 'grid' && styles.tabItemActive]}
            onPress={() => { setActiveTab('grid'); Haptics.selectionAsync(); }}
          >
            <Ionicons name="grid-outline" size={22} color={activeTab === 'grid' ? '#fff' : Colors.dark.textMuted} />
          </Pressable>
          <Pressable
            style={[styles.tabItem, activeTab === 'tagged' && styles.tabItemActive]}
            onPress={() => { setActiveTab('tagged'); Haptics.selectionAsync(); }}
          >
            <Ionicons name="person-outline" size={22} color={activeTab === 'tagged' ? '#fff' : Colors.dark.textMuted} />
          </Pressable>
        </View>

        {activeTab === 'grid' ? (
          <View style={styles.postsGrid}>
            {USER_POSTS.map(post => (
              <Pressable key={post.id} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
                <Image source={{ uri: post.imageUrl }} style={styles.gridImage} />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.emptyTagged}>
            <Ionicons name="person-outline" size={48} color={Colors.dark.textMuted} />
            <Text style={styles.emptyTaggedTitle}>Photos of you</Text>
            <Text style={styles.emptyTaggedSubtitle}>When people tag you in photos, they'll appear here</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </Pressable>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Pressable onPress={handleSaveProfile}>
                <Ionicons name="checkmark" size={28} color={Colors.dark.accent} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Display Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editDisplayName}
                  onChangeText={setEditDisplayName}
                  placeholderTextColor={Colors.dark.textMuted}
                  placeholder="Enter display name"
                />
              </View>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Bio</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalInputBio]}
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholderTextColor={Colors.dark.textMuted}
                  placeholder="Write something about yourself..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 10,
  },
  headerUsername: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    letterSpacing: -0.3,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 24,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 3,
    borderColor: '#000',
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
  },
  bioSection: {
    paddingHorizontal: 20,
    gap: 2,
    marginBottom: 14,
  },
  displayName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  bioText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  editBtn: {
    flex: 1,
    backgroundColor: Colors.dark.surfaceLight,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: Colors.dark.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#fff',
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridImage: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    backgroundColor: Colors.dark.surface,
  },
  emptyTagged: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTaggedTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  emptyTaggedSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.dark.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.dark.border,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  modalBody: {
    padding: 20,
    gap: 20,
  },
  modalField: {
    gap: 8,
  },
  modalLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: Colors.dark.surfaceLight,
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  modalInputBio: {
    height: 100,
  },
});
