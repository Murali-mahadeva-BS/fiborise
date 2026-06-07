import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Clock } from "lucide-react-native";
import { Platform, Text, View } from "react-native";
import { useColorScheme } from "nativewind";

import { Button } from "@/components/ui/button";
import {
  formatReminderTimeLabel,
  reminderTimeToDate,
  timeFromDate,
} from "@/lib/reminders";

type ReminderTimePickerProps = {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function ReminderTimePicker({
  label,
  value,
  error,
  onChange,
}: ReminderTimePickerProps) {
  const { colorScheme } = useColorScheme();
  const textColor = colorScheme === "dark" ? "#f7fbf6" : "#315c45";

  const openAndroidPicker = () => {
    DateTimePickerAndroid.open({
      value: reminderTimeToDate(value),
      mode: "time",
      is24Hour: false,
      display: "default",
      positiveButton: { label: "Set" },
      negativeButton: { label: "Cancel" },
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          onChange(timeFromDate(selectedDate));
        }
      },
    });
  };

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-charcoal-700 dark:text-sage-100">
        {label}
      </Text>

      {Platform.OS === "android" ? (
        <Button
          variant="ghost"
          className="justify-between"
          onPress={openAndroidPicker}
        >
          <View className="flex-row items-center gap-2">
            <Clock size={18} color={textColor} />
            <Text className="text-base font-semibold text-moss-700 dark:text-sage-50">
              {formatReminderTimeLabel(value)}
            </Text>
          </View>
        </Button>
      ) : (
        <View
          className={`rounded-2xl border bg-white px-2 py-1 dark:bg-charcoal-900 ${
            error
              ? "border-red-500 dark:border-red-400"
              : "border-sage-200 dark:border-charcoal-700"
          }`}
        >
          <DateTimePicker
            value={reminderTimeToDate(value)}
            mode="time"
            display="compact"
            accentColor="#315c45"
            themeVariant={colorScheme === "dark" ? "dark" : "light"}
            onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
              if (event.type === "set" && selectedDate) {
                onChange(timeFromDate(selectedDate));
              }
            }}
          />
        </View>
      )}

      {error ? (
        <Text className="text-sm text-red-600 dark:text-red-300">{error}</Text>
      ) : null}
    </View>
  );
}
