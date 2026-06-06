import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ArrowLeft, Check, X } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDisplayDate, getTodayLocalDate } from '@/lib/dates';
import { getHabitTrackingSummary, getLogsForHabit } from '@/features/habits/selectors';
import { useAppStore } from '@/store/app-store';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const today = useMemo(() => getTodayLocalDate(), []);
  const habits = useAppStore((state) => state.habits);
  const logs = useAppStore((state) => state.logs);
  const loadApp = useAppStore((state) => state.loadApp);
  const markHabitDone = useAppStore((state) => state.markHabitDone);
  const markHabitNotDone = useAppStore((state) => state.markHabitNotDone);
  const habit = habits.find((item) => item.id === id);
  const summary = habit ? getHabitTrackingSummary(habit, logs, today) : undefined;
  const habitLogs = habit ? getLogsForHabit(logs, habit.id).slice(-8).reverse() : [];

  useEffect(() => {
    void loadApp(db);
  }, [db, loadApp]);

  const handleNotDone = () => {
    if (!habit || !summary) {
      return;
    }

    if (!summary.doneToday) {
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

  if (!habit || !summary) {
    return (
      <SafeAreaView className="flex-1 bg-sage-50 px-5 py-6 dark:bg-charcoal-950">
        <View className="gap-6">
          <Button variant="ghost" accessibilityLabel="Go back" onPress={() => router.back()}>
            <ArrowLeft size={22} color="#315c45" />
          </Button>
          <Card>
            <Text className="text-base leading-6 text-charcoal-600 dark:text-sage-200">
              This habit could not be found.
            </Text>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sage-50 dark:bg-charcoal-950">
      <ScrollView contentContainerClassName="gap-6 px-5 pb-8 pt-4">
        <View className="flex-row items-center gap-3">
          <Button variant="ghost" accessibilityLabel="Go back" onPress={() => router.back()}>
            <ArrowLeft size={22} color="#315c45" />
          </Button>
          <View className="flex-1">
            <Text className="text-3xl font-bold text-charcoal-950 dark:text-sage-50">
              {habit.icon} {habit.name}
            </Text>
            <Text className="mt-1 text-base text-charcoal-600 dark:text-sage-200">
              Started {formatDisplayDate(habit.startDate)}
            </Text>
          </View>
        </View>

        <Card className="gap-4">
          <View className="rounded-2xl bg-sage-100 p-4 dark:bg-charcoal-800">
            <Text className="text-sm font-semibold uppercase tracking-wide text-moss-700 dark:text-moss-200">
              Today&apos;s target
            </Text>
            <Text className="mt-1 text-3xl font-bold text-charcoal-950 dark:text-sage-50">
              {summary.target.label}
            </Text>
            <Text className="mt-2 text-base text-charcoal-600 dark:text-sage-200">
              Level {summary.target.level}
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
            <Button variant="ghost" className="flex-1" onPress={handleNotDone}>
              <X size={18} color="#315c45" />
              <Text className="text-base font-semibold text-moss-700 dark:text-sage-50">
                Not done
              </Text>
            </Button>
          </View>
        </Card>

        <Card className="gap-4">
          <Text className="text-xl font-semibold text-charcoal-950 dark:text-sage-50">
            Progress
          </Text>
          <View className="gap-3">
            <Metric label="Total done days" value={String(summary.totalDoneDays)} />
            <Metric label="Current Level" value={`Level ${summary.progress.level}`} />
            <Metric
              label="Level progress"
              value={`${summary.progress.doneDaysInLevel} / ${summary.progress.requiredDoneDays} days`}
            />
          </View>
        </Card>

        <Card className="gap-4">
          <Text className="text-xl font-semibold text-charcoal-950 dark:text-sage-50">
            Recent done days
          </Text>
          {habitLogs.length === 0 ? (
            <Text className="text-base leading-6 text-charcoal-600 dark:text-sage-200">
              No done days yet.
            </Text>
          ) : (
            <View className="gap-3">
              {habitLogs.map((log) => (
                <View
                  key={log.id}
                  className="flex-row items-center justify-between rounded-2xl bg-sage-100 px-4 py-3 dark:bg-charcoal-800"
                >
                  <Text className="text-base font-semibold text-charcoal-950 dark:text-sage-50">
                    {formatDisplayDate(log.localDate)}
                  </Text>
                  <Text className="text-base text-charcoal-600 dark:text-sage-200">
                    Level {log.level}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-4 rounded-2xl bg-sage-100 px-4 py-3 dark:bg-charcoal-800">
      <Text className="flex-1 text-base text-charcoal-600 dark:text-sage-200">{label}</Text>
      <Text className="text-base font-semibold text-charcoal-950 dark:text-sage-50">{value}</Text>
    </View>
  );
}
