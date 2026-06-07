import { Link, router } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import { useRef, useState } from "react";
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
import { useSQLiteContext } from "expo-sqlite";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReminderTimePicker } from "@/components/reminder-time-picker";
import { TextField } from "@/components/ui/text-field";
import {
  HabitFormErrors,
  HabitFormValues,
  parseHabitForm,
} from "@/features/habits/habit-form";
import { HabitIconPicker } from "@/features/habits/icon-picker";
import {
  defaultHabitIconValue,
  normalizeHabitIconValue,
} from "@/features/habits/icons";
import { useAndroidBackHandler } from "@/lib/navigation/use-android-back-handler";
import { requestReminderPermission } from "@/lib/notifications/reminders";
import { defaultReminderTime } from "@/lib/reminders";
import { useAppStore } from "@/store/app-store";

const initialValues: HabitFormValues = {
  name: "",
  icon: defaultHabitIconValue,
  baseAmount: "",
  unit: "",
  description: "",
  reminderEnabled: false,
  reminderTime: defaultReminderTime,
};

export default function NewHabitScreen() {
  const db = useSQLiteContext();
  const createHabit = useAppStore((state) => state.createHabit);
  const scrollViewRef = useRef<ScrollView>(null);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<HabitFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useAndroidBackHandler(() => {
    router.navigate("/?transition=back");
    return true;
  });

  const updateField = (field: keyof HabitFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const scrollToFormEnd = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 250);
  };

  const updateReminderEnabled = async (enabled: boolean) => {
    if (!enabled) {
      setValues((current) => ({ ...current, reminderEnabled: false }));
      return;
    }

    const granted = await requestReminderPermission();
    if (!granted) {
      Alert.alert(
        "Notifications disabled",
        "Allow notifications to enable habit reminders.",
      );
      return;
    }

    setValues((current) => ({ ...current, reminderEnabled: true }));
  };

  const handleSubmit = async () => {
    const parsed = parseHabitForm(values);

    if (!parsed.ok) {
      setErrors(parsed.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await createHabit(db, parsed.data);
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Could not create habit",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          contentContainerStyle={{ flexGrow: 1 }}
          contentContainerClassName="gap-6 px-5 pb-10 pt-4"
        >
          <View className="flex-row items-center gap-3">
            <Link href="/?transition=back" asChild>
              <Button variant="ghost" accessibilityLabel="Go back">
                <ArrowLeft size={22} color="#315c45" />
              </Button>
            </Link>
            <View>
              <Text className="text-3xl font-bold text-charcoal-950 dark:text-sage-50">
                New habit
              </Text>
              <Text className="mt-1 text-base text-charcoal-600 dark:text-sage-200">
                Start at Level 0 today.
              </Text>
            </View>
          </View>

          <Card className="gap-5">
            <HabitIconPicker
              value={normalizeHabitIconValue(values.icon)}
              onChange={(icon) => updateField("icon", icon)}
            />

            <TextField
              label="Habit name"
              value={values.name}
              error={errors.name}
              autoCapitalize="words"
              returnKeyType="next"
              placeholder="Running"
              onChangeText={(value) => updateField("name", value)}
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextField
                  label="Baseline"
                  value={values.baseAmount}
                  error={errors.baseAmount}
                  keyboardType="decimal-pad"
                  placeholder="100"
                  onChangeText={(value) => updateField("baseAmount", value)}
                />
              </View>
              <View className="flex-1">
                <TextField
                  label="Unit"
                  value={values.unit}
                  error={errors.unit}
                  autoCapitalize="none"
                  placeholder="m"
                  onChangeText={(value) => updateField("unit", value)}
                />
              </View>
            </View>

            <TextField
              label="Description"
              value={values.description}
              error={errors.description}
              multiline
              textAlignVertical="top"
              className="min-h-24"
              placeholder="Optional note"
              onFocus={scrollToFormEnd}
              onChangeText={(value) => updateField("description", value)}
            />

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
                  value={values.reminderEnabled}
                  onValueChange={(enabled) => {
                    void updateReminderEnabled(enabled);
                  }}
                  trackColor={{ false: "#cfe3c9", true: "#3f7657" }}
                  thumbColor={values.reminderEnabled ? "#f7fbf6" : "#ffffff"}
                />
              </View>

              {values.reminderEnabled ? (
                <ReminderTimePicker
                  label="Reminder time"
                  value={values.reminderTime}
                  error={errors.reminderTime}
                  onChange={(value) => updateField("reminderTime", value)}
                />
              ) : null}
            </View>
          </Card>

          <Button
            disabled={isSubmitting}
            className={isSubmitting ? "opacity-60" : ""}
            onPress={handleSubmit}
          >
            <Check size={20} color="#f7fbf6" />
            <Text className="text-base font-semibold text-sage-50">
              {isSubmitting ? "Creating..." : "Create habit"}
            </Text>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
