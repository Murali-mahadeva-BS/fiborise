import { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';

type CardProps = ComponentProps<typeof View> & {
  children: ReactNode;
};

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={`rounded-2xl border border-sage-200 bg-white p-5 shadow-sm shadow-charcoal-950/5 dark:border-charcoal-700 dark:bg-charcoal-900 ${className ?? ''}`}
      {...props}
    >
      {children}
    </View>
  );
}
