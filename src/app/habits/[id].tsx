import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 bg-sage-50 px-5 py-6 dark:bg-charcoal-950">
      <View className="gap-6">
        <Text className="text-3xl font-bold text-charcoal-950 dark:text-sage-50">
          Habit detail
        </Text>
        <Card>
          <Text className="text-base leading-6 text-charcoal-600 dark:text-sage-200">
            Detail screen placeholder for habit {id ?? 'unknown'}.
          </Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}
