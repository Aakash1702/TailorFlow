import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { supabaseDataService } from '../services/SupabaseDataService';
import { useMigration } from '../hooks/useMigration';
import { AuthScreen } from '../screens/AuthScreen';
import { MigrationScreen } from '../screens/MigrationScreen';
import MainTabNavigator from './MainTabNavigator';
import { useTheme } from '../hooks/useTheme';

export type RootStackParamList = {
  Auth: undefined;
  Migration: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { theme } = useTheme();
  const { session, isLoading, profile, shop } = useAuth();
  const [showMigration, setShowMigration] = useState(false);
  const [checkingMigration, setCheckingMigration] = useState(false);
  const { checkMigrationNeeded } = useMigration(shop?.id || null);

  useEffect(() => {
    if (shop?.id) {
      supabaseDataService.setShopId(shop.id);
    }
  }, [shop?.id]);

  useEffect(() => {
    const checkMigration = async () => {
      if (session && shop?.id) {
        setCheckingMigration(true);
        const needsMigration = await checkMigrationNeeded();
        setShowMigration(needsMigration);
        setCheckingMigration(false);
      }
    };
    checkMigration();
  }, [session, shop?.id, checkMigrationNeeded]);

  if (isLoading || checkingMigration) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : showMigration ? (
        <Stack.Screen name="Migration">
          {() => <MigrationScreen onComplete={() => setShowMigration(false)} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
