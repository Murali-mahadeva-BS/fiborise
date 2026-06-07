import { Link, router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  Archive,
  ArrowLeft,
  RotateCcw,
  SunMoon,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HabitIconGlyph } from "@/features/habits/icons";
import { getLogsForHabit } from "@/features/habits/selectors";
import { Habit, ThemePreference } from "@/features/habits/types";
import { formatDisplayDate } from "@/lib/dates";
import { useAndroidBackHandler } from "@/lib/navigation/use-android-back-handler";
import { useAppStore } from "@/store/app-store";

const themeOptions: { label: string; value: ThemePreference }[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const { colorScheme } = useColorScheme();
  const destructiveTextColor = colorScheme === "dark" ? "#fca5a5" : "#b91c1c";
  const archivedHabits = useAppStore((state) => state.archivedHabits);
  const logs = useAppStore((state) => state.logs);
  const themePreference = useAppStore(
    (state) => state.settings?.themePreference ?? "system",
  );
  const deleteArchivedHabit = useAppStore((state) => state.deleteArchivedHabit);
  const restoreArchivedHabit = useAppStore(
    (state) => state.restoreArchivedHabit,
  );
  const updateThemePreference = useAppStore(
    (state) => state.updateThemePreference,
  );
  const [deletingHabitId, setDeletingHabitId] = useState<string | undefined>();
  const [restoringHabitId, setRestoringHabitId] = useState<
    string | undefined
  >();
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);

  useAndroidBackHandler(() => {
    router.navigate("/?transition=back");
    return true;
  });

  const handleDeleteArchivedHabit = (habit: Habit) => {
    Alert.alert(
      "Delete habit?",
      "Are you sure you want to delete this habit?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setDeletingHabitId(habit.id);
            void deleteArchivedHabit(db, habit.id)
              .catch((error) => {
                Alert.alert(
                  "Could not delete habit",
                  error instanceof Error ? error.message : "Please try again.",
                );
              })
              .finally(() => {
                setDeletingHabitId(undefined);
              });
          },
        },
      ],
    );
  };

  const handleRestoreHabit = (habit: Habit) => {
    setRestoringHabitId(habit.id);
    void restoreArchivedHabit(db, habit.id)
      .catch((error) => {
        Alert.alert(
          "Could not restore habit",
          error instanceof Error ? error.message : "Please try again.",
        );
      })
      .finally(() => {
        setRestoringHabitId(undefined);
      });
  };

  const handleThemeChange = (nextTheme: ThemePreference) => {
    if (nextTheme === themePreference) {
      return;
    }

    setIsUpdatingTheme(true);
    void updateThemePreference(db, nextTheme)
      .catch((error) => {
        Alert.alert(
          "Could not update theme",
          error instanceof Error ? error.message : "Please try again.",
        );
      })
      .finally(() => {
        setIsUpdatingTheme(false);
      });
  };

  return (
    <SafeAreaView className="flex-1 bg-sage-50 dark:bg-charcoal-950">
      <ScrollView contentContainerClassName="gap-6 px-5 pb-8 pt-4">
        <View className="flex-row items-center gap-3">
          <Link href="/?transition=back" asChild>
            <Button variant="ghost" accessibilityLabel="Go back">
              <ArrowLeft size={22} color="#315c45" />
            </Button>
          </Link>
          <Text className="text-3xl font-bold text-charcoal-950 dark:text-sage-50">
            Settings
          </Text>
        </View>

        <Card className="gap-4">
          <View className="flex-row items-center gap-2">
            <SunMoon size={22} color="#315c45" />
            <Text className="text-lg font-semibold text-charcoal-950 dark:text-sage-50">
              Appearance
            </Text>
          </View>
          <Text className="text-base leading-6 text-charcoal-600 dark:text-sage-200">
            Choose whether Fiborise follows system theme or stays in light or
            dark mode.
          </Text>
          <View className="flex-row gap-2">
            {themeOptions.map((option) => {
              const selected = option.value === themePreference;

              return (
                <Button
                  key={option.value}
                  variant={selected ? "primary" : "ghost"}
                  disabled={isUpdatingTheme}
                  className={`flex-1 ${isUpdatingTheme ? "opacity-60" : ""}`}
                  onPress={() => handleThemeChange(option.value)}
                >
                  <Text
                    className={`text-base font-semibold ${
                      selected
                        ? "text-sage-50"
                        : "text-moss-700 dark:text-sage-50"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Button>
              );
            })}
          </View>
        </Card>

        <Card className="gap-4">
          <View className="gap-1">
            <View className="flex-row items-center gap-2">
              <Archive size={22} color="#315c45" />
              <Text className="text-xl font-semibold text-charcoal-950 dark:text-sage-50">
                Archived habits
              </Text>
            </View>
            <Text className="text-base text-charcoal-600 dark:text-sage-200">
              Restore any archived habit back to Today or delete it permanently.
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
                const isRestoring = restoringHabitId === habit.id;
                const isDeleting = deletingHabitId === habit.id;

                return (
                  <View
                    key={habit.id}
                    className="gap-3 rounded-2xl border border-sage-200 bg-sage-50 p-4 dark:border-charcoal-700 dark:bg-charcoal-800"
                  >
                    <View className="flex-row items-start gap-3">
                      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-charcoal-900">
                        <HabitIconGlyph value={habit.icon} size={22} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-charcoal-950 dark:text-sage-50">
                          {habit.name}
                        </Text>
                        <Text className="mt-1 text-sm text-charcoal-600 dark:text-sage-200">
                          {doneDays} done days
                          {archivedDate ? ` - Archived ${archivedDate}` : ""}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row gap-3">
                      <Button
                        className={`flex-1 ${isRestoring ? "opacity-60" : ""}`}
                        disabled={isRestoring || isDeleting}
                        onPress={() => handleRestoreHabit(habit)}
                      >
                        <RotateCcw size={18} color="#f7fbf6" />
                        <Text className="text-base font-semibold text-sage-50">
                          {isRestoring ? "Restoring..." : "Restore"}
                        </Text>
                      </Button>

                      <Button
                        variant="ghost"
                        disabled={isRestoring || isDeleting}
                        className={`flex-1 ${isDeleting ? "opacity-60" : ""}`}
                        onPress={() => handleDeleteArchivedHabit(habit)}
                      >
                        <Trash2 size={18} color={destructiveTextColor} />
                        <Text className="text-base font-semibold text-red-700 dark:text-red-300">
                          {isDeleting ? "Deleting..." : "Delete"}
                        </Text>
                      </Button>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
