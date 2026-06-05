import { Link } from 'expo-router';
import { CirclePlus, Settings } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function HomeScreen() {
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

        <Card className="gap-4">
          <View className="gap-2">
            <Text className="text-xl font-semibold text-charcoal-950 dark:text-sage-50">
              Start your first level
            </Text>
            <Text className="text-base leading-6 text-charcoal-600 dark:text-sage-200">
              Create a habit with a small baseline. Level 0 is just showing up.
            </Text>
          </View>

          <Link href="/habits/new" asChild>
            <Button>
              <CirclePlus size={20} color="#f7fbf6" />
              <Text className="text-base font-semibold text-sage-50">Create habit</Text>
            </Button>
          </Link>
        </Card>

        <Card className="gap-3 border border-sage-200 bg-white/80 dark:border-charcoal-700 dark:bg-charcoal-900">
          <Text className="text-sm font-semibold uppercase tracking-wide text-moss-700 dark:text-moss-200">
            Today
          </Text>
          <Text className="text-base leading-6 text-charcoal-600 dark:text-sage-200">
            Habit tracking UI will appear here after the Level engine and local storage are wired.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
