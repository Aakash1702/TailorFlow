import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';
import { Provider } from '@supabase/supabase-js';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../contexts/AuthContext';
import { ThemedText } from '../components/ThemedText';
import { Button } from '../components/Button';
import { useTheme } from '../hooks/useTheme';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

type AuthMode = 'login' | 'signup' | 'forgotPassword';

export function AuthScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, signUp, signInWithOAuth, resetPassword } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: Provider) => {
    setOauthLoading(provider);
    setError(null);

    const { error } = await signInWithOAuth(provider);
    
    if (error) {
      setError(error.message);
    }
    
    setOauthLoading(null);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
          setError('Unable to connect to the server. Please check your internet connection and try again.');
        } else {
          setError(error.message);
        }
      }
    } catch (err: any) {
      if (err?.message?.includes('Network') || err?.message?.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError(err?.message || 'An unexpected error occurred');
      }
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error } = await signUp(email, password, fullName, shopName);
    
    if (error) {
      setError(error.message);
    } else {
      setSuccessMessage('Account created successfully! Please check your email to verify your account.');
      setMode('login');
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error } = await resetPassword(email);
    
    if (error) {
      setError(error.message);
    } else {
      setSuccessMessage('Password reset link sent to your email');
      setMode('login');
    }
    
    setIsLoading(false);
  };

  const renderOAuthButtons = () => (
    <View style={styles.oauthContainer}>
      <View style={styles.dividerContainer}>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        <ThemedText style={[styles.dividerText, { color: theme.textSecondary }]}>
          or continue with
        </ThemedText>
        <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
      </View>
      
      <View style={styles.oauthButtons}>
        <Pressable
          style={({ pressed }) => [
            styles.oauthButton,
            { 
              backgroundColor: '#FFFFFF',
              borderColor: theme.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={() => handleOAuthSignIn('google')}
          disabled={oauthLoading !== null}
        >
          {oauthLoading === 'google' ? (
            <ActivityIndicator size="small" color="#1F1F1F" />
          ) : (
            <>
              <GoogleIcon size={20} />
              <ThemedText 
                style={[styles.oauthButtonText, { color: '#1F1F1F' }]}
              >
                Continue with Google
              </ThemedText>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );

  const renderForm = () => {
    if (mode === 'forgotPassword') {
      return (
        <>
          <ThemedText style={styles.subtitle}>
            Enter your email address and we will send you a link to reset your password.
          </ThemedText>

          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Feather name="mail" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <Button
            onPress={handleForgotPassword}
            disabled={isLoading}
            style={styles.button}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.buttonText} />
            ) : (
              'Send Reset Link'
            )}
          </Button>

          <Pressable onPress={() => { setMode('login'); setError(null); }}>
            <ThemedText style={[styles.linkText, { color: theme.link }]}>
              Back to Login
            </ThemedText>
          </Pressable>
        </>
      );
    }

    if (mode === 'signup') {
      return (
        <>
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Feather name="user" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Full Name"
                placeholderTextColor={theme.textSecondary}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Feather name="home" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Shop Name"
                placeholderTextColor={theme.textSecondary}
                value={shopName}
                onChangeText={setShopName}
                autoCapitalize="words"
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Feather name="mail" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Email"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Feather name="lock" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.textSecondary} />
              </Pressable>
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              <Feather name="lock" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Confirm Password"
                placeholderTextColor={theme.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>
          </View>

          <Button
            onPress={handleSignUp}
            disabled={isLoading}
            style={styles.button}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.buttonText} />
            ) : (
              'Create Account'
            )}
          </Button>

          <View style={styles.switchModeContainer}>
            <ThemedText style={styles.switchModeText}>
              Already have an account?
            </ThemedText>
            <Pressable onPress={() => { setMode('login'); setError(null); }}>
              <ThemedText style={[styles.linkText, { color: theme.link }]}>
                {' '}Login
              </ThemedText>
            </Pressable>
          </View>

          {renderOAuthButtons()}
        </>
      );
    }

    return (
      <>
        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <Feather name="mail" size={20} color={theme.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={[styles.inputWrapper, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <Feather name="lock" size={20} color={theme.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.textSecondary} />
            </Pressable>
          </View>
        </View>

        <Pressable onPress={() => { setMode('forgotPassword'); setError(null); }}>
          <ThemedText style={[styles.forgotPassword, { color: theme.link }]}>
            Forgot Password?
          </ThemedText>
        </Pressable>

        <Button
          onPress={handleLogin}
          disabled={isLoading}
          style={styles.button}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.buttonText} />
          ) : (
            'Login'
          )}
        </Button>

        <View style={styles.switchModeContainer}>
          <ThemedText style={styles.switchModeText}>
            Don't have an account?
          </ThemedText>
          <Pressable onPress={() => { setMode('signup'); setError(null); }}>
            <ThemedText style={[styles.linkText, { color: theme.link }]}>
              {' '}Sign Up
            </ThemedText>
          </Pressable>
        </View>

        {renderOAuthButtons()}
      </>
    );
  };

  const ScrollComponent = Platform.OS === 'web' ? ScrollView : KeyboardAwareScrollView;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollComponent
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing['2xl'], paddingBottom: insets.bottom + Spacing['2xl'] }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <View style={[styles.logoWrapper, { backgroundColor: theme.primary }]}>
            <Feather name="scissors" size={40} color="#FFFFFF" />
          </View>
          <ThemedText type="h1" style={styles.appName}>
            TailorFlow
          </ThemedText>
          <ThemedText type="small" style={[styles.tagline, { color: theme.textSecondary }]}>
            Professional Tailoring Management
          </ThemedText>
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h2" style={styles.title}>
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </ThemedText>

          {error ? (
            <View style={[styles.messageBox, { backgroundColor: Colors.light.error + '15' }]}>
              <Feather name="alert-circle" size={18} color={Colors.light.error} />
              <ThemedText style={[styles.messageText, { color: Colors.light.error }]}>
                {error}
              </ThemedText>
            </View>
          ) : null}

          {successMessage ? (
            <View style={[styles.messageBox, { backgroundColor: Colors.light.success + '15' }]}>
              <Feather name="check-circle" size={18} color={Colors.light.success} />
              <ThemedText style={[styles.messageText, { color: Colors.light.success }]}>
                {successMessage}
              </ThemedText>
            </View>
          ) : null}

          {renderForm()}
        </View>
      </ScrollComponent>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  appName: {
    marginBottom: Spacing.xs,
  },
  tagline: {
    textAlign: 'center',
  },
  formCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  messageText: {
    flex: 1,
    fontSize: Typography.small.fontSize,
  },
  inputContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    height: '100%',
  },
  eyeIcon: {
    padding: Spacing.xs,
  },
  forgotPassword: {
    textAlign: 'right',
    marginBottom: Spacing.lg,
    fontSize: Typography.small.fontSize,
  },
  button: {
    marginBottom: Spacing.lg,
  },
  switchModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: Typography.small.fontSize,
  },
  linkText: {
    fontSize: Typography.small.fontSize,
    fontWeight: '600',
  },
  oauthContainer: {
    marginTop: Spacing.xl,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
    fontSize: Typography.small.fontSize,
  },
  oauthButtons: {
    gap: Spacing.md,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  oauthButtonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: '500',
  },
});
