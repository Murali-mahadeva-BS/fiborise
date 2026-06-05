import { create } from 'zustand';

type AppState = {
  onboardingCompleted: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  onboardingCompleted: false,
  completeOnboarding: () => set({ onboardingCompleted: true }),
  resetOnboarding: () => set({ onboardingCompleted: false }),
}));
