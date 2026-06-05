import { Archive, Database } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-sage-50 px-5 py-6 dark:bg-charcoal-950">
      <View className="gap-6">
        <Text className="text-3xl font-bold text-charcoal-950 dark:text-sage-50">
          Settings
        </Text>

        <Card className="gap-3">
          <Archive size={22} color="#315c45" />
          <View className="gap-1">
            <Text className="text-lg font-semibold text-charcoal-950 dark:text-sage-50">
              Archived habits
            </Text>
            <Text className="text-base text-charcoal-600 dark:text-sage-200">
              Archived habit management will live here.
            </Text>
          </View>
        </Card>

        <Card className="gap-3">
          <Database size={22} color="#315c45" />
          <View className="gap-1">
            <Text className="text-lg font-semibold text-charcoal-950 dark:text-sage-50">
              Local data
            </Text>
            <Text className="text-base text-charcoal-600 dark:text-sage-200">
              SQLite setup and sync metadata will be added in the storage milestone.
            </Text>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}
