import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ArrowRight, Check } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store/app-store';

export default function OnboardingScreen() {
  const db = useSQLiteContext();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  const finishOnboarding = async (nextRoute: '/' | '/habits/new') => {
    await completeOnboarding(db);
    router.replace(nextRoute);
  };

  return (
    <SafeAreaView className="flex-1 bg-sage-50 px-5 py-6 dark:bg-charcoal-950">
      <View className="flex-1 justify-between">
        <View className="gap-6">
          <Text className="text-4xl font-bold text-charcoal-950 dark:text-sage-50">
            Build habits by levels
          </Text>

          <Card className="gap-3">
            <Text className="text-lg font-semibold text-charcoal-950 dark:text-sage-50">
              0, 1, 1, 2, 3, 5...
            </Text>
            <Text className="text-base leading-6 text-charcoal-600 dark:text-sage-200">
              Level 0 is the first day. After that, Fiborise grows your target only when you mark a day done.
            </Text>
          </Card>

          <Card className="gap-3">
            <Text className="text-lg font-semibold text-charcoal-950 dark:text-sage-50">
              Local first
            </Text>
            <Text className="text-base leading-6 text-charcoal-600 dark:text-sage-200">
              Your MVP data stays on this device, with a sync-ready structure for future login support.
            </Text>
          </Card>
        </View>

        <View className="gap-3">
          <Button
            onPress={() => {
              void finishOnboarding('/habits/new');
            }}
          >
            <Text className="text-base font-semibold text-sage-50">Create first habit</Text>
            <ArrowRight size={20} color="#f7fbf6" />
          </Button>
          <Button
            variant="ghost"
            onPress={() => {
              void finishOnboarding('/');
            }}
          >
            <Check size={20} color="#315c45" />
            <Text className="text-base font-semibold text-moss-700 dark:text-sage-50">Skip</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
