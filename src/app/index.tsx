import { Link, router } from "expo-router";
import { Check, CirclePlus, Settings, X } from "lucide-react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HabitIconGlyph } from "@/features/habits/icons";
import { getHabitTrackingSummary } from "@/features/habits/selectors";
import { Habit } from "@/features/habits/types";
import { getTodayLocalDate } from "@/lib/dates";
import { useAndroidBackHandler } from "@/lib/navigation/use-android-back-handler";
import { useAppStore } from "@/store/app-store";

export default function HomeScreen() {
  const db = useSQLiteContext();
  const today = useMemo(() => getTodayLocalDate(), []);
  const habits = useAppStore((state) => state.habits);
  const logs = useAppStore((state) => state.logs);
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const markHabitDone = useAppStore((state) => state.markHabitDone);
  const markHabitNotDone = useAppStore((state) => state.markHabitNotDone);
  const [pendingAction, setPendingAction] = useState<
    { habitId: string; action: "done" | "notDone" } | undefined
  >();
  const [pressedHabitId, setPressedHabitId] = useState<string | undefined>();
  const clearPressedHabitTimer = useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);

  useEffect(() => {
    return () => {
      if (clearPressedHabitTimer.current) {
        clearTimeout(clearPressedHabitTimer.current);
      }
    };
  }, []);

  useAndroidBackHandler(() => {
    BackHandler.exitApp();
    return true;
  });

  const runHabitAction = async (
    habit: Habit,
    action: "done" | "notDone",
    task: () => Promise<void>,
  ) => {
    setPendingAction({ habitId: habit.id, action });
    try {
      await task();
    } catch (error) {
      Alert.alert(
        action === "done" ? "Could not mark done" : "Could not mark not done",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setPendingAction((current) =>
        current?.habitId === habit.id ? undefined : current,
      );
    }
  };

  const handleDone = (habit: Habit) => {
    void runHabitAction(habit, "done", () =>
      markHabitDone(db, habit.id, today),
    );
  };

  const handleNotDone = (habit: Habit, doneToday: boolean) => {
    if (!doneToday) {
      void runHabitAction(habit, "notDone", () =>
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
            void runHabitAction(habit, "notDone", () =>
              markHabitNotDone(db, habit.id, today),
            );
          },
        },
      ],
    );
  };

  const handleHabitCardPressIn = (habitId: string) => {
    if (clearPressedHabitTimer.current) {
      clearTimeout(clearPressedHabitTimer.current);
    }
    setPressedHabitId(habitId);
  };

  const handleHabitCardPressOut = (habitId: string) => {
    clearPressedHabitTimer.current = setTimeout(() => {
      setPressedHabitId((current) =>
        current === habitId ? undefined : current,
      );
    }, 260);
  };

  const handleHabitCardPress = (habit: Habit) => {
    router.push(`/habits/${habit.id}`);
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
            <Text className="text-base text-red-700 dark:text-red-300">
              {error}
            </Text>
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
                Create a habit with a small baseline. Level 0 is just showing
                up.
              </Text>
            </View>

            <Link href="/habits/new" asChild>
              <Button>
                <CirclePlus size={20} color="#f7fbf6" />
                <Text className="text-base font-semibold text-sage-50">
                  Create habit
                </Text>
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
              const isPending = pendingAction?.habitId === habit.id;
              const isPressed = pressedHabitId === habit.id;

              return (
                <View
                  key={habit.id}
                  className={`gap-4 ${
                    isPressed
                      ? "rounded-2xl border border-sage-200 bg-sage-100 p-5 shadow-sm shadow-charcoal-950/5 dark:border-charcoal-700 dark:bg-charcoal-800"
                      : "rounded-2xl border border-sage-200 bg-white p-5 shadow-sm shadow-charcoal-950/5 dark:border-charcoal-700 dark:bg-charcoal-900"
                  }`}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${habit.name}`}
                    className="gap-4 rounded-2xl"
                    onPress={() => handleHabitCardPress(habit)}
                    onPressIn={() => handleHabitCardPressIn(habit.id)}
                    onPressOut={() => handleHabitCardPressOut(habit.id)}
                  >
                    <View className="flex-row items-start justify-between gap-3 rounded-2xl">
                      <View className="flex-1 flex-row gap-3">
                        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-sage-100 dark:bg-charcoal-800">
                          <HabitIconGlyph value={habit.icon} size={22} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-lg font-semibold text-charcoal-950 dark:text-sage-50">
                            {habit.name}
                          </Text>
                          <Text className="mt-1 text-sm text-charcoal-600 dark:text-sage-200">
                            Level {summary.target.level} - {progressText}
                          </Text>
                        </View>
                      </View>

                      <View className="items-end gap-2">
                        {habit.stayModeEnabled ? (
                          <View className="rounded-full bg-sage-200 px-3 py-1 dark:bg-charcoal-800">
                            <Text className="text-xs font-semibold text-moss-700 dark:text-moss-200">
                              Stay
                            </Text>
                          </View>
                        ) : null}
                        {summary.doneToday ? (
                          <View className="rounded-full bg-moss-700 px-3 py-1">
                            <Text className="text-xs font-semibold text-sage-50">
                              Done
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>

                    <View className="rounded-2xl border border-sage-200 p-4 dark:border-charcoal-700">
                      <Text className="text-sm font-semibold uppercase tracking-wide text-moss-700 dark:text-moss-200">
                        Target
                      </Text>
                      <Text className="mt-1 text-2xl font-bold text-charcoal-950 dark:text-sage-50">
                        {summary.target.label}
                      </Text>
                    </View>
                  </Pressable>

                  <View className="flex-row gap-3">
                    <Button
                      className={`flex-1 ${summary.doneToday || isPending ? "opacity-60" : ""}`}
                      disabled={summary.doneToday || isPending}
                      onPress={() => {
                        handleDone(habit);
                      }}
                    >
                      <Check size={18} color="#f7fbf6" />
                      <Text className="text-base font-semibold text-sage-50">
                        {pendingAction?.habitId === habit.id &&
                        pendingAction.action === "done"
                          ? "Saving..."
                          : "Done"}
                      </Text>
                    </Button>
                    <Button
                      variant="outline"
                      disabled={isPending}
                      className={`flex-1 ${isPending ? "opacity-60" : ""}`}
                      onPress={() => handleNotDone(habit, summary.doneToday)}
                    >
                      <X size={18} color="#315c45" />
                      <Text className="text-base font-semibold text-moss-700 dark:text-sage-50">
                        {pendingAction?.habitId === habit.id &&
                        pendingAction.action === "notDone"
                          ? "Saving..."
                          : "Not done"}
                      </Text>
                    </Button>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
