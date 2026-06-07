import { Link, router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  Archive,
  ArrowLeft,
  Bell,
  Check,
  CirclePause,
  Pencil,
  X,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReminderTimePicker } from "@/components/reminder-time-picker";
import { HabitIconGlyph } from "@/features/habits/icons";
import { getHabitTrackingSummary } from "@/features/habits/selectors";
import { HabitReportSection } from "@/features/reports/components/habit-report-section";
import { buildHabitReport } from "@/features/reports/calculations";
import {
  addLocalMonths,
  formatDisplayDate,
  getMonthStart,
  getTodayLocalDate,
} from "@/lib/dates";
import { useAndroidBackHandler } from "@/lib/navigation/use-android-back-handler";
import { defaultReminderTime, isValidReminderTime } from "@/lib/reminders";
import { useAppStore } from "@/store/app-store";

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const today = useMemo(() => getTodayLocalDate(), []);
  const currentMonthStart = useMemo(() => getMonthStart(today), [today]);
  const { colorScheme } = useColorScheme();
  const destructiveTextColor = colorScheme === "dark" ? "#fca5a5" : "#b91c1c";
  const habits = useAppStore((state) => state.habits);
  const logs = useAppStore((state) => state.logs);
  const markHabitDone = useAppStore((state) => state.markHabitDone);
  const markHabitNotDone = useAppStore((state) => state.markHabitNotDone);
  const archiveHabit = useAppStore((state) => state.archiveHabit);
  const updateHabitReminder = useAppStore((state) => state.updateHabitReminder);
  const updateHabitStayMode = useAppStore((state) => state.updateHabitStayMode);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingStayMode, setIsSavingStayMode] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(defaultReminderTime);
  const [reminderTimeError, setReminderTimeError] = useState<
    string | undefined
  >();
  const [isSavingReminder, setIsSavingReminder] = useState(false);
  const [stayModeEnabled, setStayModeEnabled] = useState(false);
  const [viewedMonth, setViewedMonth] = useState(currentMonthStart);
  const habit = habits.find((item) => item.id === id);
  const summary = habit
    ? getHabitTrackingSummary(habit, logs, today)
    : undefined;
  const report = habit
    ? buildHabitReport(habit, logs, today, viewedMonth)
    : undefined;

  useAndroidBackHandler(() => {
    router.navigate("/?transition=back");
    return true;
  });

  useEffect(() => {
    if (!habit) {
      return;
    }

    setReminderEnabled(habit.reminderEnabled);
    setReminderTime(habit.reminderTime ?? defaultReminderTime);
    setReminderTimeError(undefined);
    setStayModeEnabled(habit.stayModeEnabled);
  }, [habit]);

  useEffect(() => {
    setViewedMonth(currentMonthStart);
  }, [currentMonthStart, id]);

  const runStatusAction = async (
    action: "done" | "notDone",
    task: () => Promise<void>,
  ) => {
    setIsSavingStatus(true);
    try {
      await task();
    } catch (error) {
      Alert.alert(
        action === "done" ? "Could not mark done" : "Could not mark not done",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleDone = () => {
    if (!habit) {
      return;
    }

    void runStatusAction("done", () => markHabitDone(db, habit.id, today));
  };

  const handleNotDone = () => {
    if (!habit || !summary) {
      return;
    }

    if (!summary.doneToday) {
      void runStatusAction("notDone", () =>
        markHabitNotDone(db, habit.id, today),
      );
      return;
    }

    Alert.alert(
      "Mark not done?",
      `This removes today's done mark for ${habit.name}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark not done",
          style: "destructive",
          onPress: () => {
            void runStatusAction("notDone", () =>
              markHabitNotDone(db, habit.id, today),
            );
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
      "Archive habit?",
      "Are you sure you want to archive this habit?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: () => {
            setIsArchiving(true);
            void archiveHabit(db, habit.id)
              .then(() => {
                router.replace("/");
              })
              .catch((error) => {
                Alert.alert(
                  "Could not archive habit",
                  error instanceof Error ? error.message : "Please try again.",
                );
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
      setReminderTimeError("Use HH:mm format");
      return false;
    }

    setIsSavingReminder(true);
    try {
      const updated = await updateHabitReminder(db, habit.id, {
        reminderEnabled: nextEnabled,
        reminderTime: nextTime,
      });

      if (!updated) {
        Alert.alert(
          "Notifications disabled",
          "Allow notifications to enable habit reminders.",
        );
        setReminderEnabled(false);
        return false;
      }

      return true;
    } catch (error) {
      Alert.alert(
        "Could not update reminder",
        error instanceof Error ? error.message : "Please try again.",
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

  const handleStayModeToggle = (enabled: boolean) => {
    if (!habit) {
      return;
    }

    setStayModeEnabled(enabled);
    setIsSavingStayMode(true);

    void updateHabitStayMode(db, habit.id, enabled)
      .catch((error) => {
        setStayModeEnabled(!enabled);
        Alert.alert(
          "Could not update Stay Mode",
          error instanceof Error ? error.message : "Please try again.",
        );
      })
      .finally(() => {
        setIsSavingStayMode(false);
      });
  };

  if (!habit || !summary) {
    return (
      <SafeAreaView className="flex-1 bg-sage-50 px-5 py-6 dark:bg-charcoal-950">
        <View className="gap-6">
          <Link href="/?transition=back" asChild>
            <Button variant="ghost" accessibilityLabel="Go back">
              <ArrowLeft size={22} color="#315c45" />
            </Button>
          </Link>
          <Card>
            <Text className="text-base leading-6 text-charcoal-600 dark:text-sage-200">
              This habit could not be found.
            </Text>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  const firstHabitMonth = getMonthStart(habit.startDate);
  const canGoToPreviousMonth = firstHabitMonth < getMonthStart(viewedMonth);
  const canGoToNextMonth = getMonthStart(viewedMonth) < currentMonthStart;

  return (
    <SafeAreaView className="flex-1 bg-sage-50 dark:bg-charcoal-950">
      <ScrollView contentContainerClassName="gap-6 px-5 pb-8 pt-4">
        <View className="flex-row items-center gap-3">
          <Link href="/?transition=back" asChild>
            <Button variant="ghost" accessibilityLabel="Go back">
              <ArrowLeft size={22} color="#315c45" />
            </Button>
          </Link>
          <View className="flex-1 flex-row items-center gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-sage-100 dark:bg-charcoal-800">
              <HabitIconGlyph value={habit.icon} size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-charcoal-950 dark:text-sage-50">
                {habit.name}
              </Text>
              <Text className="mt-1 text-base text-charcoal-600 dark:text-sage-200">
                Started {formatDisplayDate(habit.startDate)}
              </Text>
            </View>
          </View>
          <Button
            variant="ghost"
            accessibilityLabel="Edit habit"
            onPress={() => router.push(`/habits/edit/${habit.id}`)}
          >
            <Pencil size={20} color="#315c45" />
          </Button>
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
              className={`flex-1 ${summary.doneToday || isSavingStatus ? "opacity-60" : ""}`}
              disabled={summary.doneToday || isSavingStatus}
              onPress={handleDone}
            >
              <Check size={18} color="#f7fbf6" />
              <Text className="text-base font-semibold text-sage-50">
                {isSavingStatus ? "Saving..." : "Done"}
              </Text>
            </Button>
            <Button
              variant="outline"
              disabled={isSavingStatus}
              className={`flex-1 ${isSavingStatus ? "opacity-60" : ""}`}
              onPress={handleNotDone}
            >
              <X size={18} color="#315c45" />
              <Text className="text-base font-semibold text-moss-700 dark:text-sage-50">
                {isSavingStatus ? "Saving..." : "Not done"}
              </Text>
            </Button>
          </View>
        </Card>

        <Card className="gap-4">
          <Text className="text-xl font-semibold text-charcoal-950 dark:text-sage-50">
            Progress
          </Text>
          <View className="gap-3">
            <Metric
              label="Total done days"
              value={String(summary.totalDoneDays)}
            />
            <Metric
              label="Current Level"
              value={`Level ${summary.progress.level}`}
            />
            <Metric
              label="Level progress"
              value={`${summary.progress.doneDaysInLevel} / ${summary.progress.requiredDoneDays} days`}
            />
          </View>
        </Card>

        {report ? (
          <HabitReportSection
            report={report}
            unit={habit.unit}
            canGoToPreviousMonth={canGoToPreviousMonth}
            canGoToNextMonth={canGoToNextMonth}
            onPreviousMonth={() =>
              setViewedMonth((current) => addLocalMonths(current, -1))
            }
            onNextMonth={() =>
              setViewedMonth((current) => addLocalMonths(current, 1))
            }
          />
        ) : null}

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
              trackColor={{ false: "#cfe3c9", true: "#3f7657" }}
              thumbColor={reminderEnabled ? "#f7fbf6" : "#ffffff"}
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
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 flex-row gap-3">
              <CirclePause size={22} color="#315c45" />
              <View className="flex-1">
                <Text className="text-xl font-semibold text-charcoal-950 dark:text-sage-50">
                  Stay Mode
                </Text>
                <Text className="mt-1 text-base leading-6 text-charcoal-600 dark:text-sage-200">
                  Freeze the current target while done days still count in
                  reports.
                </Text>
              </View>
            </View>
            <Switch
              value={stayModeEnabled}
              disabled={isSavingStayMode}
              onValueChange={handleStayModeToggle}
              trackColor={{ false: "#cfe3c9", true: "#3f7657" }}
              thumbColor={stayModeEnabled ? "#f7fbf6" : "#ffffff"}
            />
          </View>
        </Card>

        <Card className="gap-4 border-red-200 bg-red-50 dark:border-red-400 dark:bg-charcoal-900">
          <View className="gap-1">
            <Text className="text-xl font-semibold text-charcoal-950 dark:text-sage-50">
              Archive habit
            </Text>
            <Text className="text-base leading-6 text-charcoal-600 dark:text-sage-200">
              Archived habits leave Today until you restore them from Settings.
            </Text>
          </View>

          <Button
            variant="ghost"
            disabled={isArchiving}
            className={isArchiving ? "opacity-60" : ""}
            onPress={handleArchive}
          >
            <Archive size={18} color={destructiveTextColor} />
            <Text className="text-base font-semibold text-red-700 dark:text-red-300">
              {isArchiving ? "Archiving..." : "Archive"}
            </Text>
          </Button>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between rounded-2xl bg-sage-100 px-4 py-3 dark:bg-charcoal-800">
      <Text className="text-base text-charcoal-600 dark:text-sage-200">
        {label}
      </Text>
      <Text className="text-base font-semibold text-charcoal-950 dark:text-sage-50">
        {value}
      </Text>
    </View>
  );
}
