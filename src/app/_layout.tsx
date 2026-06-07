import "../global.css";

import { Stack } from "expo-router";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { Suspense, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useColorScheme } from "nativewind";

import { databaseName, initializeDatabase } from "@/lib/storage/database";
import { configureNotificationHandler } from "@/lib/notifications/reminders";
import { useAppStore } from "@/store/app-store";

configureNotificationHandler();

export default function RootLayout() {
  return (
    <Suspense
      fallback={
        <View className="flex-1 items-center justify-center bg-sage-50 dark:bg-charcoal-950">
          <ActivityIndicator color="#315c45" />
        </View>
      }
    >
      <SQLiteProvider
        databaseName={databaseName}
        onInit={initializeDatabase}
        useSuspense
      >
        <AppShell />
      </SQLiteProvider>
    </Suspense>
  );
}

function AppShell() {
  const db = useSQLiteContext();
  const { colorScheme, setColorScheme } = useColorScheme();
  const hasLoaded = useAppStore((state) => state.hasLoaded);
  const isLoading = useAppStore((state) => state.isLoading);
  const themePreference = useAppStore(
    (state) => state.settings?.themePreference ?? "system",
  );
  const loadApp = useAppStore((state) => state.loadApp);

  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      void loadApp(db);
    }
  }, [db, hasLoaded, isLoading, loadApp]);

  useEffect(() => {
    setColorScheme(themePreference);
  }, [setColorScheme, themePreference]);

  return (
    <>
      <Stack
        screenOptions={({ route }) => {
          const params = route.params as
            | { transition?: string }
            | undefined;
          const isBackTransition = params?.transition === "back";

          return {
            headerShown: false,
            animation: isBackTransition
              ? "slide_from_left"
              : "slide_from_right",
            animationDuration: 220,
            contentStyle: {
              backgroundColor: colorScheme === "dark" ? "#101512" : "#f7fbf6",
            },
          };
        }}
      />
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </>
  );
}
