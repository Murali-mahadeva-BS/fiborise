import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { getHabitReminderIdentifier, parseReminderTime } from '@/lib/reminders';

const habitReminderChannelId = 'habit-reminders';
let notificationHandlerConfigured = false;

export function configureNotificationHandler() {
  if (notificationHandlerConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  notificationHandlerConfigured = true;
}

export async function requestReminderPermission(): Promise<boolean> {
  configureNotificationHandler();
  await ensureAndroidReminderChannel();

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleHabitReminder(input: {
  habitId: string;
  habitName: string;
  reminderTime: string;
  targetLabel: string;
}): Promise<boolean> {
  const granted = await requestReminderPermission();
  if (!granted) {
    return false;
  }

  const { hour, minute } = parseReminderTime(input.reminderTime);
  const identifier = getHabitReminderIdentifier(input.habitId);

  await cancelHabitReminder(input.habitId);
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: input.habitName,
      body: `Today's target: ${input.targetLabel}`,
      data: {
        habitId: input.habitId,
      },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: habitReminderChannelId,
    },
  });

  return true;
}

export async function cancelHabitReminder(habitId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(getHabitReminderIdentifier(habitId));
}

async function ensureAndroidReminderChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(habitReminderChannelId, {
    name: 'Habit reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}
