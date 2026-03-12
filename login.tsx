import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  async function handleSubmit() {
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (!isLogin && !displayName.trim()) {
      setError('Please enter your display name');
      return;
    }

    setLoading(true);
    setError('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      let success: boolean;
      if (isLogin) {
        success = await login(username.trim(), password);
        if (!success) setError('Invalid username or password');
      } else {
        success = await signup(username.trim(), password, displayName.trim());
        if (!success) setError('Username already taken');
      }
      if (success) {
        router.replace('/(tabs)');
      }
    } catch (e) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E1306C', '#833AB4', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.keyboardView, { paddingTop: insets.top + webTopInset }]}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={Colors.dark.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <Ionicons name="camera" size={36} color="#fff" />
            </LinearGradient>
            <Text style={styles.appName}>Vibe</Text>
            <Text style={styles.tagline}>Share your moments</Text>
          </View>

          <View style={styles.formContainer}>
            {!isLogin && (
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={Colors.dark.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Display Name"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Ionicons name="at" size={20} color={Colors.dark.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={Colors.dark.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.dark.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.dark.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.dark.textMuted} />
              </Pressable>
            </View>

            {!!error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={Colors.dark.like} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.8 }]}
            >
              <LinearGradient
                colors={Colors.dark.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>{isLogin ? 'Log In' : 'Sign Up'}</Text>
                )}
              </LinearGradient>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              onPress={() => {
                setIsLogin(!isLogin);
                setError('');
                Haptics.selectionAsync();
              }}
              style={({ pressed }) => [styles.switchBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Text style={styles.switchTextBold}>{isLogin ? 'Sign Up' : 'Log In'}</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 40,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  formContainer: {
    gap: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surfaceLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    height: 52,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    height: '100%',
  },
  eyeBtn: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    color: Colors.dark.like,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  submitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  submitGradient: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.dark.border,
  },
  dividerText: {
    color: Colors.dark.textMuted,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    marginHorizontal: 16,
  },
  switchBtn: {
    alignItems: 'center',
    padding: 8,
  },
  switchText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  switchTextBold: {
    color: Colors.dark.accentLight,
    fontFamily: 'Inter_700Bold',
  },
});
