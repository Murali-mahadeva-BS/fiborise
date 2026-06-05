import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';

export default function NewHabitScreen() {
  return (
    <SafeAreaView className="flex-1 bg-sage-50 px-5 py-6 dark:bg-charcoal-950">
      <View className="gap-6">
        <Text className="text-3xl font-bold text-charcoal-950 dark:text-sage-50">
          New habit
        </Text>
        <Card>
          <Text className="text-base leading-6 text-charcoal-600 dark:text-sage-200">
            Habit creation form will be built after storage and form foundations are in place.
          </Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}
