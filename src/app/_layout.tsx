import '../global.css';

import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

import { databaseName, initializeDatabase } from '@/lib/storage/database';
import { configureNotificationHandler } from '@/lib/notifications/reminders';

configureNotificationHandler();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Suspense
        fallback={
          <View className="flex-1 items-center justify-center bg-sage-50 dark:bg-charcoal-950">
            <ActivityIndicator color="#315c45" />
          </View>
        }
      >
        <SQLiteProvider databaseName={databaseName} onInit={initializeDatabase} useSuspense>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: colorScheme === 'dark' ? '#101512' : '#f7fbf6',
              },
            }}
          />
        </SQLiteProvider>
      </Suspense>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
