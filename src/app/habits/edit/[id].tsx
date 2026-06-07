import { Link, router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { ArrowLeft, Check } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReminderTimePicker } from "@/components/reminder-time-picker";
import { TextField } from "@/components/ui/text-field";
import { HabitIconPicker } from "@/features/habits/icon-picker";
import { normalizeHabitIconValue } from "@/features/habits/icons";
import { formatTargetAmount } from "@/lib/levels";
import { useAndroidBackHandler } from "@/lib/navigation/use-android-back-handler";
import { requestReminderPermission } from "@/lib/notifications/reminders";
import { defaultReminderTime, isValidReminderTime } from "@/lib/reminders";
import { useAppStore } from "@/store/app-store";

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const scrollViewRef = useRef<ScrollView>(null);
  const descriptionInputY = useRef(0);
  const habits = useAppStore((state) => state.habits);
  const updateHabitIdentity = useAppStore((state) => state.updateHabitIdentity);
  const updateHabitReminder = useAppStore((state) => state.updateHabitReminder);
  const habit = habits.find((item) => item.id === id);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [descriptionError, setDescriptionError] = useState<
    string | undefined
  >();
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(defaultReminderTime);
  const [reminderTimeError, setReminderTimeError] = useState<
    string | undefined
  >();
  const [isSaving, setIsSaving] = useState(false);

  useAndroidBackHandler(() => {
    router.navigate(
      habit ? `/habits/${habit.id}?transition=back` : "/?transition=back",
    );
    return true;
  });

  useEffect(() => {
    if (!habit) {
      return;
    }

    setName(habit.name);
    setIcon(normalizeHabitIconValue(habit.icon));
    setDescription(habit.description ?? "");
    setNameError(undefined);
    setDescriptionError(undefined);
    setReminderEnabled(habit.reminderEnabled);
    setReminderTime(habit.reminderTime ?? defaultReminderTime);
    setReminderTimeError(undefined);
  }, [habit]);

  const scrollToDescription = () => {
    const scroll = () => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(descriptionInputY.current - 24, 0),
        animated: true,
      });
    };

    setTimeout(scroll, 80);
    setTimeout(scroll, 320);
  };

  const updateReminderEnabled = async (enabled: boolean) => {
    setReminderEnabled(enabled);

    if (!enabled) {
      return;
    }

    const granted = await requestReminderPermission();
    if (!granted) {
      setReminderEnabled(false);
      Alert.alert(
        "Notifications disabled",
        "Allow notifications to enable habit reminders.",
      );
      return;
    }
  };

  const handleReminderTimeChange = (value: string) => {
    setReminderTime(value);
    setReminderTimeError(undefined);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!habit) {
      return;
    }

    if (!trimmedName) {
      setNameError("Name is required");
      return;
    }

    if (trimmedDescription.length > 240) {
      setDescriptionError("Description is too long");
      return;
    }

    if (reminderEnabled && !isValidReminderTime(reminderTime)) {
      setReminderTimeError("Use HH:mm format");
      return;
    }

    setIsSaving(true);
    try {
      await updateHabitIdentity(db, habit.id, {
        name: trimmedName,
        icon: normalizeHabitIconValue(icon),
        description: trimmedDescription || undefined,
      });

      const updatedReminder = await updateHabitReminder(db, habit.id, {
        reminderEnabled,
        reminderTime: reminderTime || defaultReminderTime,
      });

      if (!updatedReminder) {
        Alert.alert(
          "Notifications disabled",
          "Allow notifications to enable habit reminders.",
        );
        setReminderEnabled(false);
        return;
      }

      router.navigate(`/habits/${habit.id}?transition=back`);
    } catch (error) {
      Alert.alert(
        "Could not update habit",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!habit) {
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

  return (
    <SafeAreaView className="flex-1 bg-sage-50 dark:bg-charcoal-950">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollViewRef}
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 192 }}
          contentContainerClassName="gap-6 px-5 pt-4"
        >
          <View className="flex-row items-center gap-3">
            <Link href={`/habits/${habit.id}?transition=back`} asChild>
              <Button variant="ghost" accessibilityLabel="Go back">
                <ArrowLeft size={22} color="#315c45" />
              </Button>
            </Link>
            <View>
              <Text className="text-3xl font-bold text-charcoal-950 dark:text-sage-50">
                Edit habit
              </Text>
              <Text className="mt-1 text-base text-charcoal-600 dark:text-sage-200">
                Update the icon and habit name.
              </Text>
            </View>
          </View>

          <Card className="gap-5">
            <HabitIconPicker value={icon} onChange={setIcon} />

            <TextField
              label="Habit name"
              value={name}
              error={nameError}
              autoCapitalize="words"
              returnKeyType="done"
              placeholder="Running"
              onChangeText={(value) => {
                setName(value);
                setNameError(undefined);
              }}
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextField
                  label="Baseline"
                  value={formatTargetAmount(habit.baseAmount)}
                  editable={false}
                  className="opacity-70"
                />
              </View>
              <View className="flex-1">
                <TextField
                  label="Unit"
                  value={habit.unit}
                  editable={false}
                  className="opacity-70"
                />
              </View>
            </View>

            <View
              onLayout={(event) => {
                descriptionInputY.current = event.nativeEvent.layout.y;
              }}
            >
              <TextField
                label="Description"
                value={description}
                error={descriptionError}
                multiline
                textAlignVertical="top"
                className="min-h-24"
                placeholder="Optional note"
                onFocus={scrollToDescription}
                onChangeText={(value) => {
                  setDescription(value);
                  setDescriptionError(undefined);
                }}
              />
            </View>

            <View className="gap-4 rounded-2xl bg-sage-100 p-4 dark:bg-charcoal-800">
              <View className="flex-row items-center justify-between gap-4">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-charcoal-950 dark:text-sage-50">
                    Daily reminder
                  </Text>
                  <Text className="mt-1 text-base text-charcoal-600 dark:text-sage-200">
                    Remind me about this habit.
                  </Text>
                </View>
                <Switch
                  value={reminderEnabled}
                  onValueChange={(enabled) => {
                    void updateReminderEnabled(enabled);
                  }}
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
            </View>
          </Card>

          <Button
            disabled={isSaving}
            className={isSaving ? "opacity-60" : ""}
            onPress={handleSave}
          >
            <Check size={20} color="#f7fbf6" />
            <Text className="text-base font-semibold text-sage-50">
              {isSaving ? "Saving..." : "Save changes"}
            </Text>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
