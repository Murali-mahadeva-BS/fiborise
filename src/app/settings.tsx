import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Archive, ArrowLeft, Database, Trash2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { Alert, ScrollView, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getLogsForHabit } from '@/features/habits/selectors';
import { Habit } from '@/features/habits/types';
import { formatDisplayDate } from '@/lib/dates';
import { useAppStore } from '@/store/app-store';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const colorScheme = useColorScheme();
  const destructiveTextColor = colorScheme === 'dark' ? '#fca5a5' : '#b91c1c';
  const archivedHabits = useAppStore((state) => state.archivedHabits);
  const logs = useAppStore((state) => state.logs);
  const loadApp = useAppStore((state) => state.loadApp);
  const deleteArchivedHabit = useAppStore((state) => state.deleteArchivedHabit);

  useEffect(() => {
    void loadApp(db);
  }, [db, loadApp]);

  const handleDeleteArchivedHabit = (habit: Habit) => {
    Alert.alert(
      'Delete habit?',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteArchivedHabit(db, habit.id);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-sage-50 dark:bg-charcoal-950">
      <ScrollView contentContainerClassName="gap-6 px-5 pb-8 pt-4">
        <View className="flex-row items-center gap-3">
          <Button variant="ghost" accessibilityLabel="Go back" onPress={() => router.back()}>
            <ArrowLeft size={22} color="#315c45" />
          </Button>
          <Text className="text-3xl font-bold text-charcoal-950 dark:text-sage-50">
            Settings
          </Text>
        </View>

        <Card className="gap-4">
          <View className="gap-1">
            <View className="flex-row items-center gap-2">
              <Archive size={22} color="#315c45" />
              <Text className="text-xl font-semibold text-charcoal-950 dark:text-sage-50">
                Archived habits
              </Text>
            </View>
            <Text className="text-base text-charcoal-600 dark:text-sage-200">
              Archived habits are hidden from Today.
            </Text>
          </View>

          {archivedHabits.length === 0 ? (
            <Text className="text-base leading-6 text-charcoal-600 dark:text-sage-200">
              No archived habits yet.
            </Text>
          ) : (
            <View className="gap-3">
              {archivedHabits.map((habit) => {
                const doneDays = getLogsForHabit(logs, habit.id).length;
                const archivedDate = habit.archivedAt
                  ? formatDisplayDate(habit.archivedAt.slice(0, 10))
                  : undefined;

                return (
                  <View
                    key={habit.id}
                    className="gap-3 rounded-2xl border border-sage-200 bg-sage-50 p-4 dark:border-charcoal-700 dark:bg-charcoal-800"
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1 flex-row gap-3">
                        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-charcoal-900">
                          <Text className="text-2xl">{habit.icon}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-charcoal-950 dark:text-sage-50">
                            {habit.name}
                          </Text>
                          <Text className="mt-1 text-sm text-charcoal-600 dark:text-sage-200">
                            {doneDays} done days
                            {archivedDate ? ` - Archived ${archivedDate}` : ''}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Button variant="ghost" onPress={() => handleDeleteArchivedHabit(habit)}>
                      <Trash2 size={18} color={destructiveTextColor} />
                      <Text className="text-base font-semibold text-red-700 dark:text-red-300">
                        Delete
                      </Text>
                    </Button>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        <Card className="gap-3">
          <Database size={22} color="#315c45" />
          <View className="gap-1">
            <Text className="text-lg font-semibold text-charcoal-950 dark:text-sage-50">
              Local data
            </Text>
            <Text className="text-base text-charcoal-600 dark:text-sage-200">
              Habits and done days are stored locally in SQLite with sync-ready IDs and timestamps.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
