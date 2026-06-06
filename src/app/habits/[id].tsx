import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Archive, ArrowLeft, Bell, Check, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Switch, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ReminderTimePicker } from '@/components/reminder-time-picker';
import { formatDisplayDate, getTodayLocalDate } from '@/lib/dates';
import { getHabitTrackingSummary, getLogsForHabit } from '@/features/habits/selectors';
import { HabitReportSection } from '@/features/reports/components/habit-report-section';
import { buildHabitReport } from '@/features/reports/calculations';
import { defaultReminderTime, isValidReminderTime } from '@/lib/reminders';
import { useAppStore } from '@/store/app-store';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const today = useMemo(() => getTodayLocalDate(), []);
  const colorScheme = useColorScheme();
  const destructiveTextColor = colorScheme === 'dark' ? '#fca5a5' : '#b91c1c';
  const habits = useAppStore((state) => state.habits);
  const logs = useAppStore((state) => state.logs);
  const loadApp = useAppStore((state) => state.loadApp);
  const markHabitDone = useAppStore((state) => state.markHabitDone);
  const markHabitNotDone = useAppStore((state) => state.markHabitNotDone);
  const archiveHabit = useAppStore((state) => state.archiveHabit);
  const updateHabitReminder = useAppStore((state) => state.updateHabitReminder);
  const [isArchiving, setIsArchiving] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(defaultReminderTime);
  const [reminderTimeError, setReminderTimeError] = useState<string | undefined>();
  const [isSavingReminder, setIsSavingReminder] = useState(false);
  const habit = habits.find((item) => item.id === id);
  const summary = habit ? getHabitTrackingSummary(habit, logs, today) : undefined;
  const allHabitLogs = habit ? getLogsForHabit(logs, habit.id) : [];
  const habitLogs = allHabitLogs.slice(-8).reverse();
  const report = habit ? buildHabitReport(habit, logs, today) : undefined;

  useEffect(() => {
    void loadApp(db);
  }, [db, loadApp]);

  useEffect(() => {
    if (!habit) {
      return;
    }

    setReminderEnabled(habit.reminderEnabled);
    setReminderTime(habit.reminderTime ?? defaultReminderTime);
    setReminderTimeError(undefined);
  }, [habit]);

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

  const handleArchive = () => {
    if (!habit) {
      return;
    }

    Alert.alert(
      'Archive habit?',
      'Are you sure you want to archive this habit?\nThis habit can be accessed from settings page',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: () => {
            setIsArchiving(true);
            void archiveHabit(db, habit.id)
              .then(() => {
                router.replace('/');
              })
              .finally(() => {
                setIsArchiving(false);
              });
          },
        },
      ],
    );
  };

  const persistReminder = async (nextEnabled: boolean, nextTime: string) => {
    if (!habit) {
      return false;
    }

    if (nextEnabled && !isValidReminderTime(nextTime)) {
      setReminderTimeError('Use HH:mm format');
      return false;
    }

    setIsSavingReminder(true);
    try {
      const updated = await updateHabitReminder(db, habit.id, {
        reminderEnabled: nextEnabled,
        reminderTime: nextTime,
      });

      if (!updated) {
        Alert.alert('Notifications disabled', 'Allow notifications to enable habit reminders.');
        setReminderEnabled(false);
        return false;
      }

      return true;
    } catch (error) {
      Alert.alert(
        'Could not update reminder',
        error instanceof Error ? error.message : 'Please try again.',
      );
      return false;
    } finally {
      setIsSavingReminder(false);
    }
  };

  const handleReminderToggle = (enabled: boolean) => {
    setReminderEnabled(enabled);
    void persistReminder(enabled, reminderTime).then((saved) => {
      if (!saved && enabled) {
        setReminderEnabled(false);
      }
    });
  };

  const handleReminderTimeChange = (value: string) => {
    setReminderTime(value);
    setReminderTimeError(undefined);

    if (!reminderEnabled) {
      return;
    }

    void persistReminder(true, value);
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

        {report ? <HabitReportSection report={report} unit={habit.unit} /> : null}

        <Card className="gap-4">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 flex-row gap-3">
              <Bell size={22} color="#315c45" />
              <View className="flex-1">
                <Text className="text-xl font-semibold text-charcoal-950 dark:text-sage-50">
                  Daily reminder
                </Text>
                <Text className="mt-1 text-base leading-6 text-charcoal-600 dark:text-sage-200">
                  Reminder text includes this habit&apos;s target.
                </Text>
              </View>
            </View>
            <Switch
              value={reminderEnabled}
              disabled={isSavingReminder}
              onValueChange={handleReminderToggle}
              trackColor={{ false: '#cfe3c9', true: '#3f7657' }}
              thumbColor={reminderEnabled ? '#f7fbf6' : '#ffffff'}
            />
          </View>

          {reminderEnabled ? (
            <ReminderTimePicker
              label="Reminder time"
              value={reminderTime}
              error={reminderTimeError}
              onChange={handleReminderTimeChange}
            />
          ) : null}
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

        <Card className="gap-4 border-red-200 bg-red-50 dark:border-red-400 dark:bg-charcoal-900">
          <View className="gap-1">
            <Text className="text-xl font-semibold text-charcoal-950 dark:text-sage-50">
              Archive habit
            </Text>
            <Text className="text-base leading-6 text-charcoal-600 dark:text-sage-200">
              Archived habits leave Today and can be deleted from Settings.
            </Text>
          </View>

          <Button
            variant="ghost"
            disabled={isArchiving}
            className={isArchiving ? 'opacity-60' : ''}
            onPress={handleArchive}
          >
            <Archive size={18} color={destructiveTextColor} />
            <Text className="text-base font-semibold text-red-700 dark:text-red-300">
              {isArchiving ? 'Archiving...' : 'Archive'}
            </Text>
          </Button>
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
