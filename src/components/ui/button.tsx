import { ComponentProps, forwardRef, ReactNode } from "react";
import { Pressable, View } from "react-native";

type ButtonVariant = "primary" | "ghost" | "outline";

type ButtonProps = ComponentProps<typeof Pressable> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    "min-h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-moss-700 px-5 py-3 active:bg-moss-800",
  ghost:
    "min-h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-sage-100 px-4 py-3 active:bg-sage-200 dark:bg-charcoal-800 dark:active:bg-charcoal-700",
  outline:
    "min-h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-sage-200 bg-transparent px-4 py-3 active:bg-sage-100 dark:border-charcoal-700 dark:active:bg-charcoal-800",
};

export const Button = forwardRef<View, ButtonProps>(function Button(
  { children, className, variant = "primary", ...props },
  ref,
) {
  return (
    <Pressable
      ref={ref}
      className={`${variantClassNames[variant]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </Pressable>
  );
});
