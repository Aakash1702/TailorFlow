import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useMigration } from '../hooks/useMigration';
import { ThemedText } from '../components/ThemedText';
import { Button } from '../components/Button';
import { useTheme } from '../hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

type MigrationScreenProps = {
  onComplete: () => void;
};

export function MigrationScreen({ onComplete }: MigrationScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { shop } = useAuth();
  const {
    isMigrating,
    migrationError,
    migrationProgress,
    migrateData,
    skipMigration,
  } = useMigration(shop?.id || null);

  const [migrationComplete, setMigrationComplete] = useState(false);

  const handleMigrate = async () => {
    const success = await migrateData();
    if (success) {
      setMigrationComplete(true);
    }
  };

  const handleSkip = async () => {
    await skipMigration();
    onComplete();
  };

  const handleContinue = () => {
    onComplete();
  };

  if (migrationComplete) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: insets.top + Spacing['2xl'], paddingBottom: insets.bottom + Spacing['2xl'] }]}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: Colors.light.success + '20' }]}>
            <Feather name="check-circle" size={60} color={Colors.light.success} />
          </View>
          <ThemedText type="h2" style={styles.title}>
            Migration Complete
          </ThemedText>
          <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
            Your data has been successfully migrated to the cloud. You can now access your information from any device.
          </ThemedText>
          <Button onPress={handleContinue} style={styles.button}>
            Continue to App
          </Button>
        </View>
      </View>
    );
  }

  if (isMigrating) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: insets.top + Spacing['2xl'], paddingBottom: insets.bottom + Spacing['2xl'] }]}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={theme.primary} style={styles.spinner} />
          <ThemedText type="h2" style={styles.title}>
            Migrating Your Data
          </ThemedText>
          <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
            Please wait while we transfer your data to the cloud...
          </ThemedText>
          <View style={[styles.progressContainer, { backgroundColor: theme.backgroundSecondary }]}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: theme.primary, width: `${migrationProgress}%` },
              ]}
            />
          </View>
          <ThemedText style={[styles.progressText, { color: theme.textSecondary }]}>
            {migrationProgress}% complete
          </ThemedText>
          <Button
            onPress={handleSkip}
            style={[styles.skipButton, { backgroundColor: theme.backgroundSecondary }]}
          >
            <ThemedText style={{ color: theme.text }}>Skip Migration</ThemedText>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: insets.top + Spacing['2xl'], paddingBottom: insets.bottom + Spacing['2xl'] }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.accent + '20' }]}>
          <Feather name="upload-cloud" size={60} color={theme.accent} />
        </View>
        <ThemedText type="h2" style={styles.title}>
          Sync Your Data
        </ThemedText>
        <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
          We found existing data on this device. Would you like to upload it to your cloud account so you can access it from anywhere?
        </ThemedText>

        {migrationError ? (
          <View style={[styles.errorBox, { backgroundColor: Colors.light.error + '15' }]}>
            <Feather name="alert-circle" size={18} color={Colors.light.error} />
            <ThemedText style={[styles.errorText, { color: Colors.light.error }]}>
              {migrationError}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.buttonContainer}>
          <Button onPress={handleMigrate} style={styles.button}>
            Migrate My Data
          </Button>
          <Button
            onPress={handleSkip}
            style={[styles.button, { backgroundColor: theme.backgroundSecondary }]}
          >
            <ThemedText style={{ color: theme.text }}>Skip for Now</ThemedText>
          </Button>
        </View>

        <ThemedText style={[styles.note, { color: theme.textSecondary }]}>
          Your local data will remain on this device even after migration.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing['2xl'],
  },
  spinner: {
    marginBottom: Spacing['2xl'],
  },
  progressContainer: {
    width: '100%',
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressText: {
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  errorText: {
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  button: {
    width: '100%',
  },
  note: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: Spacing.xl,
  },
  skipButton: {
    width: '100%',
    marginTop: Spacing.xl,
  },
});
