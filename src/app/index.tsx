import { Link, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Check, CirclePlus, Settings, X } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getHabitTrackingSummary } from '@/features/habits/selectors';
import { Habit } from '@/features/habits/types';
import { getTodayLocalDate } from '@/lib/dates';
import { useAppStore } from '@/store/app-store';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const today = useMemo(() => getTodayLocalDate(), []);
  const habits = useAppStore((state) => state.habits);
  const logs = useAppStore((state) => state.logs);
  const isLoading = useAppStore((state) => state.isLoading);
  const hasLoaded = useAppStore((state) => state.hasLoaded);
  const error = useAppStore((state) => state.error);
  const onboardingCompleted = useAppStore((state) => state.onboardingCompleted);
  const loadApp = useAppStore((state) => state.loadApp);
  const markHabitDone = useAppStore((state) => state.markHabitDone);
  const markHabitNotDone = useAppStore((state) => state.markHabitNotDone);

  useEffect(() => {
    void loadApp(db);
  }, [db, loadApp]);

  useEffect(() => {
    if (hasLoaded && !isLoading && !onboardingCompleted && habits.length === 0) {
      router.replace('/onboarding');
    }
  }, [habits.length, hasLoaded, isLoading, onboardingCompleted]);

  const handleNotDone = (habit: Habit, doneToday: boolean) => {
    if (!doneToday) {
      void markHabitNotDone(db, habit.id, today);
      return;
    }

    Alert.alert(
      'Mark not done?',
      `This removes today's done mark for ${habit.name}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark not done',
          style: 'destructive',
          onPress: () => {
            void markHabitNotDone(db, habit.id, today);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-sage-50 dark:bg-charcoal-950">
      <ScrollView contentContainerClassName="gap-6 px-5 pb-8 pt-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-charcoal-950 dark:text-sage-50">
              Fiborise
            </Text>
            <Text className="mt-1 text-base text-charcoal-600 dark:text-sage-200">
              Grow gently. Keep going.
            </Text>
          </View>

          <Link href="/settings" asChild>
            <Button variant="ghost" accessibilityLabel="Open settings">
              <Settings size={22} color="#315c45" />
            </Button>
          </Link>
        </View>

        {error ? (
          <Card className="border-red-200 bg-red-50 dark:border-red-400 dark:bg-charcoal-900">
            <Text className="text-base text-red-700 dark:text-red-300">{error}</Text>
          </Card>
        ) : null}

        {isLoading ? (
          <View className="items-center py-10">
            <ActivityIndicator color="#315c45" />
          </View>
        ) : null}

        {!isLoading && habits.length === 0 ? (
          <Card className="gap-4">
            <View className="gap-2">
              <Text className="text-xl font-semibold text-charcoal-950 dark:text-sage-50">
                Start your first level
              </Text>
              <Text className="text-base leading-6 text-charcoal-600 dark:text-sage-200">
                Create a habit with a small baseline. Level 0 is just showing up.
              </Text>
            </View>

            <Link href="/habits/new" asChild>
              <Button>
                <CirclePlus size={20} color="#f7fbf6" />
                <Text className="text-base font-semibold text-sage-50">Create habit</Text>
              </Button>
            </Link>
          </Card>
        ) : null}

        {!isLoading && habits.length > 0 ? (
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-charcoal-950 dark:text-sage-50">
                Today
              </Text>
              <Link href="/habits/new" asChild>
                <Button variant="ghost" accessibilityLabel="Create habit">
                  <CirclePlus size={22} color="#315c45" />
                </Button>
              </Link>
            </View>

            {habits.map((habit) => {
              const summary = getHabitTrackingSummary(habit, logs, today);
              const progressText = `${summary.progress.doneDaysInLevel} / ${summary.progress.requiredDoneDays} days`;

              return (
                <Card key={habit.id} className="gap-4">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 flex-row gap-3">
                      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-sage-100 dark:bg-charcoal-800">
                        <Text className="text-2xl">{habit.icon}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-charcoal-950 dark:text-sage-50">
                          {habit.name}
                        </Text>
                        <Text className="mt-1 text-sm text-charcoal-600 dark:text-sage-200">
                          Level {summary.target.level} · {progressText}
                        </Text>
                      </View>
                    </View>

                    {summary.doneToday ? (
                      <View className="rounded-full bg-moss-700 px-3 py-1">
                        <Text className="text-xs font-semibold text-sage-50">Done</Text>
                      </View>
                    ) : null}
                  </View>

                  <View className="rounded-2xl bg-sage-100 p-4 dark:bg-charcoal-800">
                    <Text className="text-sm font-semibold uppercase tracking-wide text-moss-700 dark:text-moss-200">
                      Target
                    </Text>
                    <Text className="mt-1 text-2xl font-bold text-charcoal-950 dark:text-sage-50">
                      {summary.target.label}
                    </Text>
                  </View>

                  <View className="flex-row gap-3">
                    <Button
                      className={`flex-1 ${summary.doneToday ? 'opacity-60' : ''}`}
                      disabled={summary.doneToday}
                      onPress={() => {
                        void markHabitDone(db, habit.id, today);
                      }}
                    >
                      <Check size={18} color="#f7fbf6" />
                      <Text className="text-base font-semibold text-sage-50">Done</Text>
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onPress={() => handleNotDone(habit, summary.doneToday)}
                    >
                      <X size={18} color="#315c45" />
                      <Text className="text-base font-semibold text-moss-700 dark:text-sage-50">
                        Not done
                      </Text>
                    </Button>
                  </View>

                  <Link href={`/habits/${habit.id}`} asChild>
                    <Button variant="ghost">
                      <Text className="text-base font-semibold text-moss-700 dark:text-sage-50">
                        View progress
                      </Text>
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
