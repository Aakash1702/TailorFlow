import React, { useState } from 'react';
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
import { useAuth } from '../contexts/AuthContext';
import { ThemedText } from '../components/ThemedText';
import { Button } from '../components/Button';
import { useTheme } from '../hooks/useTheme';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

type AuthMode = 'login' | 'signup' | 'forgotPassword';

type OAuthProvider = {
  id: Provider;
  name: string;
  icon: string;
  color: string;
  textColor: string;
};

const oauthProviders: OAuthProvider[] = [
  { id: 'google', name: 'Google', icon: 'globe', color: '#FFFFFF', textColor: '#1F1F1F' },
  { id: 'apple', name: 'Apple', icon: 'smartphone', color: '#000000', textColor: '#FFFFFF' },
  { id: 'github', name: 'GitHub', icon: 'github', color: '#24292F', textColor: '#FFFFFF' },
];

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

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
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
        {oauthProviders.map((provider) => (
          <Pressable
            key={provider.id}
            style={({ pressed }) => [
              styles.oauthButton,
              { 
                backgroundColor: provider.color,
                borderColor: provider.id === 'google' ? theme.border : provider.color,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => handleOAuthSignIn(provider.id)}
            disabled={oauthLoading !== null}
          >
            {oauthLoading === provider.id ? (
              <ActivityIndicator size="small" color={provider.textColor} />
            ) : (
              <>
                <Feather 
                  name={provider.icon as any} 
                  size={20} 
                  color={provider.textColor} 
                />
                <ThemedText 
                  style={[styles.oauthButtonText, { color: provider.textColor }]}
                >
                  {provider.name}
                </ThemedText>
              </>
            )}
          </Pressable>
        ))}
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
