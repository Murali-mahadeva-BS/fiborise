import { ComponentProps } from 'react';
import { Text, TextInput, View } from 'react-native';

type TextFieldProps = ComponentProps<typeof TextInput> & {
  label: string;
  error?: string;
};

export function TextField({ label, error, className, ...props }: TextFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-charcoal-700 dark:text-sage-100">{label}</Text>
      <TextInput
        className={`min-h-12 rounded-2xl border px-4 py-3 text-base text-charcoal-950 dark:text-sage-50 ${
          error
            ? 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-charcoal-900'
            : 'border-sage-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-900'
        } ${className ?? ''}`}
        placeholderTextColor="#5a665e"
        {...props}
      />
      {error ? <Text className="text-sm text-red-600 dark:text-red-300">{error}</Text> : null}
    </View>
  );
}
