import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = '@vibe_user';
const USERS_KEY = '@vibe_users';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load user:', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function getUsers(): Promise<Record<string, { password: string; profile: UserProfile }>> {
    try {
      const stored = await AsyncStorage.getItem(USERS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  async function saveUsers(users: Record<string, { password: string; profile: UserProfile }>) {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  async function login(username: string, password: string): Promise<boolean> {
    const users = await getUsers();
    const entry = users[username.toLowerCase()];
    if (entry && entry.password === password) {
      setUser(entry.profile);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entry.profile));
      return true;
    }
    return false;
  }

  async function signup(username: string, password: string, displayName: string): Promise<boolean> {
    const users = await getUsers();
    const key = username.toLowerCase();
    if (users[key]) {
      return false;
    }
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const profile: UserProfile = {
      id,
      username,
      displayName: displayName || username,
      bio: '',
      avatar: `https://api.dicebear.com/7.x/initials/png?seed=${username}&backgroundColor=E1306C`,
      postsCount: 0,
      followersCount: Math.floor(Math.random() * 500) + 10,
      followingCount: Math.floor(Math.random() * 300) + 5,
    };
    users[key] = { password, profile };
    await saveUsers(users);
    setUser(profile);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    return true;
  }

  async function logout() {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    const users = await getUsers();
    const key = user.username.toLowerCase();
    if (users[key]) {
      users[key].profile = updated;
      await saveUsers(users);
    }
  }

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
