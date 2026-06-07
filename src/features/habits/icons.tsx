import {
  Activity,
  Apple,
  Atom,
  BookOpen,
  Brain,
  Briefcase,
  ChefHat,
  Code2,
  Coffee,
  Dumbbell,
  Flame,
  Flower2,
  Gamepad2,
  Guitar,
  HeartPulse,
  type LucideIcon,
  Languages,
  Laptop2,
  Leaf,
  MoonStar,
  Music4,
  NotebookPen,
  Palette,
  PawPrint,
  PenTool,
  PersonStanding,
  Pill,
  Plane,
  Sparkles,
  Sunrise,
  Timer,
  Trees,
  Trophy,
  UtensilsCrossed,
  Waves,
} from "lucide-react-native";
import { Text } from "react-native";

export type HabitIconOption = {
  value: string;
  label: string;
  keywords: string[];
  kind: "emoji" | "icon";
  emoji?: string;
  Icon?: LucideIcon;
};

const lucideIconOptions: HabitIconOption[] = [
  iconOption("lucide:activity", "Activity", Activity, [
    "health",
    "exercise",
    "movement",
  ]),
  iconOption("lucide:apple", "Apple", Apple, ["food", "nutrition", "diet"]),
  iconOption("lucide:atom", "Atom", Atom, ["science", "study", "learning"]),
  iconOption("lucide:book-open", "Book", BookOpen, [
    "reading",
    "study",
    "pages",
  ]),
  iconOption("lucide:brain", "Brain", Brain, [
    "mindfulness",
    "focus",
    "memory",
  ]),
  iconOption("lucide:briefcase", "Work", Briefcase, [
    "career",
    "office",
    "job",
  ]),
  iconOption("lucide:chef-hat", "Cooking", ChefHat, [
    "meal",
    "kitchen",
    "food",
  ]),
  iconOption("lucide:code", "Code", Code2, [
    "programming",
    "developer",
    "software",
  ]),
  iconOption("lucide:coffee", "Coffee", Coffee, ["caffeine", "break", "drink"]),
  iconOption("lucide:dumbbell", "Strength", Dumbbell, [
    "gym",
    "workout",
    "fitness",
  ]),
  iconOption("lucide:flame", "Streak", Flame, ["consistency", "habit", "fire"]),
  iconOption("lucide:flower", "Calm", Flower2, [
    "breathing",
    "peace",
    "meditation",
  ]),
  iconOption("lucide:gamepad", "Gaming", Gamepad2, [
    "play",
    "fun",
    "controller",
  ]),
  iconOption("lucide:guitar", "Music", Guitar, [
    "practice",
    "instrument",
    "song",
  ]),
  iconOption("lucide:heart-pulse", "Cardio", HeartPulse, [
    "health",
    "run",
    "walk",
  ]),
  iconOption("lucide:languages", "Languages", Languages, [
    "speak",
    "vocabulary",
    "learn",
  ]),
  iconOption("lucide:laptop", "Laptop", Laptop2, [
    "computer",
    "deep work",
    "tech",
  ]),
  iconOption("lucide:leaf", "Nature", Leaf, ["garden", "green", "outdoors"]),
  iconOption("lucide:moon-star", "Sleep", MoonStar, [
    "rest",
    "night",
    "routine",
  ]),
  iconOption("lucide:music", "Audio", Music4, ["listen", "practice", "songs"]),
  iconOption("lucide:notebook", "Journal", NotebookPen, [
    "writing",
    "notes",
    "diary",
  ]),
  iconOption("lucide:palette", "Art", Palette, ["design", "draw", "creative"]),
  iconOption("lucide:paw", "Pet care", PawPrint, ["animals", "walk", "care"]),
  iconOption("lucide:pen-tool", "Design", PenTool, [
    "creative",
    "ui",
    "sketch",
  ]),
  iconOption("lucide:person-standing", "Posture", PersonStanding, [
    "stretch",
    "body",
    "stand",
  ]),
  iconOption("lucide:pill", "Medicine", Pill, [
    "supplements",
    "health",
    "care",
  ]),
  iconOption("lucide:plane", "Travel", Plane, ["trip", "journey", "plan"]),
  iconOption("lucide:sparkles", "Self care", Sparkles, [
    "care",
    "glow",
    "routine",
  ]),
  iconOption("lucide:sunrise", "Morning", Sunrise, [
    "wake",
    "early",
    "routine",
  ]),
  iconOption("lucide:timer", "Timer", Timer, ["time", "pomodoro", "focus"]),
  iconOption("lucide:trees", "Outside", Trees, ["walk", "park", "nature"]),
  iconOption("lucide:trophy", "Goal", Trophy, [
    "achievement",
    "win",
    "milestone",
  ]),
  iconOption("lucide:utensils", "Meal", UtensilsCrossed, [
    "eat",
    "cook",
    "nutrition",
  ]),
  iconOption("lucide:waves", "Water", Waves, ["hydrate", "swim", "drink"]),
];

const emojiIconOptions: HabitIconOption[] = [
  emojiOption("🏃", "Running", ["run", "cardio", "jog"]),
  emojiOption("🚶", "Walking", ["walk", "steps", "outdoor"]),
  emojiOption("🧘", "Meditation", ["mindfulness", "breathe", "calm"]),
  emojiOption("💪", "Workout", ["gym", "strength", "exercise"]),
  emojiOption("📚", "Reading", ["books", "study", "learn"]),
  emojiOption("🙏", "Prayer", ["spiritual", "gratitude", "faith"]),
  emojiOption("📝", "Writing", ["journal", "notes", "words"]),
  emojiOption("🎯", "Focus", ["goal", "aim", "target"]),
  emojiOption("⏱️", "Pomodoro", ["timer", "deep work", "focus"]),
  emojiOption("💧", "Hydration", ["water", "drink", "health"]),
  emojiOption("🥗", "Healthy eating", ["food", "diet", "nutrition"]),
  emojiOption("🍎", "Fruit", ["nutrition", "food", "health"]),
  emojiOption("☕", "Coffee", ["morning", "drink", "cafe"]),
  emojiOption("😴", "Sleep", ["rest", "night", "bed"]),
  emojiOption("🌅", "Morning", ["sunrise", "wake", "routine"]),
  emojiOption("🌙", "Night", ["evening", "sleep", "routine"]),
  emojiOption("🎵", "Music", ["practice", "listen", "song"]),
  emojiOption("🎸", "Guitar", ["instrument", "music", "practice"]),
  emojiOption("🎹", "Piano", ["music", "keys", "instrument"]),
  emojiOption("🎨", "Art", ["draw", "paint", "creative"]),
  emojiOption("🧠", "Mind", ["memory", "focus", "brain"]),
  emojiOption("💻", "Coding", ["programming", "computer", "software"]),
  emojiOption("📖", "Study", ["book", "learn", "reading"]),
  emojiOption("🗣️", "Speaking", ["language", "practice", "talk"]),
  emojiOption("✍️", "Journaling", ["write", "diary", "reflection"]),
  emojiOption("🧹", "Cleaning", ["tidy", "home", "chores"]),
  emojiOption("🏠", "Home", ["house", "routine", "care"]),
  emojiOption("🪴", "Plants", ["garden", "nature", "grow"]),
  emojiOption("🌿", "Nature", ["green", "outside", "fresh"]),
  emojiOption("🐕", "Dog walk", ["pet", "animal", "walk"]),
  emojiOption("🚴", "Cycling", ["bike", "fitness", "ride"]),
  emojiOption("🏊", "Swimming", ["pool", "water", "cardio"]),
  emojiOption("🧗", "Climbing", ["fitness", "outdoor", "strength"]),
  emojiOption("⚽", "Football", ["sport", "play", "exercise"]),
  emojiOption("🏸", "Badminton", ["sport", "play", "fitness"]),
  emojiOption("🏏", "Cricket", ["sport", "practice", "play"]),
  emojiOption("🧺", "Laundry", ["home", "chores", "clean"]),
  emojiOption("🍳", "Cooking", ["meal", "kitchen", "food"]),
  emojiOption("🥘", "Meal prep", ["cook", "food", "prep"]),
  emojiOption("🥤", "Smoothie", ["drink", "nutrition", "health"]),
  emojiOption("🚭", "No smoking", ["quit", "health", "habit"]),
  emojiOption("🍬", "No sugar", ["diet", "quit", "food"]),
  emojiOption("💊", "Medicine", ["supplements", "health", "care"]),
  emojiOption("🪥", "Dental care", ["brush", "teeth", "routine"]),
  emojiOption("🛏️", "Bedtime", ["sleep", "rest", "night"]),
  emojiOption("📵", "No phone", ["digital detox", "screen", "focus"]),
  emojiOption("📱", "Phone limit", ["screen time", "digital", "usage"]),
  emojiOption("🧑‍💻", "Deep work", ["laptop", "focus", "work"]),
  emojiOption("💼", "Career", ["work", "office", "job"]),
  emojiOption("💰", "Savings", ["money", "finance", "budget"]),
  emojiOption("🧾", "Budget", ["expenses", "finance", "track"]),
  emojiOption("🛒", "Shopping", ["groceries", "errands", "buy"]),
  emojiOption("🧘‍♂️", "Yoga", ["stretch", "calm", "movement"]),
  emojiOption("🤸", "Stretching", ["mobility", "body", "exercise"]),
  emojiOption("🪷", "Stillness", ["meditation", "peace", "calm"]),
  emojiOption("❤️", "Heart health", ["health", "cardio", "wellness"]),
  emojiOption("🫁", "Breathing", ["breathwork", "lungs", "calm"]),
  emojiOption("🌊", "Swim or water", ["water", "calm", "flow"]),
  emojiOption("🌞", "Sunlight", ["morning", "outside", "vitamin d"]),
  emojiOption("🚿", "Cold shower", ["bath", "reset", "routine"]),
  emojiOption("🧴", "Skin care", ["self care", "routine", "care"]),
  emojiOption("🛋️", "Reset space", ["clean", "room", "tidy"]),
  emojiOption("🧩", "Puzzle", ["brain", "games", "mind"]),
  emojiOption("♟️", "Chess", ["strategy", "practice", "game"]),
  emojiOption("🎓", "Learning", ["study", "course", "education"]),
  emojiOption("🧪", "Experiment", ["science", "lab", "explore"]),
  emojiOption("🔬", "Research", ["study", "science", "deep dive"]),
  emojiOption("🌍", "Language or travel", ["world", "travel", "culture"]),
  emojiOption("✈️", "Travel planning", ["trip", "plan", "journey"]),
  emojiOption("🚗", "Driving practice", ["commute", "skill", "travel"]),
  emojiOption("📷", "Photography", ["camera", "creative", "art"]),
  emojiOption("🎬", "Film", ["video", "creative", "watch"]),
  emojiOption("🪄", "Creative spark", ["ideas", "magic", "creative"]),
  emojiOption("🔥", "Momentum", ["streak", "consistency", "energy"]),
  emojiOption("⭐", "Highlight", ["best", "goal", "shine"]),
  emojiOption("🏆", "Achievement", ["goal", "win", "milestone"]),
  emojiOption("🌱", "Growth", ["progress", "habit", "plant"]),
  emojiOption("📈", "Progress", ["growth", "track", "metrics"]),
  emojiOption("🤝", "Relationships", ["family", "friends", "connection"]),
  emojiOption("☎️", "Call family", ["phone", "relationship", "connect"]),
  emojiOption("💬", "Reach out", ["message", "talk", "connect"]),
];

export const habitIconOptions = [...lucideIconOptions, ...emojiIconOptions];
export const defaultHabitIconValue = "emoji:🏃";

export function normalizeHabitIconValue(value: string): string {
  if (value.startsWith("lucide:") || value.startsWith("emoji:")) {
    return value;
  }

  return `emoji:${value}`;
}

export function getHabitIconOption(value: string): HabitIconOption {
  const normalizedValue = normalizeHabitIconValue(value);
  const option = habitIconOptions.find(
    (item) => item.value === normalizedValue,
  );

  if (option) {
    return option;
  }

  if (normalizedValue.startsWith("emoji:")) {
    const emoji = normalizedValue.slice("emoji:".length);
    return {
      value: normalizedValue,
      label: "Emoji",
      keywords: [],
      kind: "emoji",
      emoji,
    };
  }

  return habitIconOptions[0];
}

export function filterHabitIconOptions(query: string): HabitIconOption[] {
  const trimmedQuery = query.trim().toLowerCase();

  if (!trimmedQuery) {
    return habitIconOptions;
  }

  return habitIconOptions.filter((option) =>
    `${option.label} ${option.keywords.join(" ")}`
      .toLowerCase()
      .includes(trimmedQuery),
  );
}

export function HabitIconGlyph({
  value,
  size = 24,
  color = "#315c45",
}: {
  value: string;
  size?: number;
  color?: string;
}) {
  const option = getHabitIconOption(value);

  if (option.kind === "icon" && option.Icon) {
    const Icon = option.Icon;
    return <Icon size={size} color={color} />;
  }

  return <Text style={{ fontSize: size }}>{option.emoji}</Text>;
}

function iconOption(
  value: string,
  label: string,
  Icon: LucideIcon,
  keywords: string[],
): HabitIconOption {
  return {
    value,
    label,
    keywords,
    kind: "icon",
    Icon,
  };
}

function emojiOption(
  emoji: string,
  label: string,
  keywords: string[],
): HabitIconOption {
  return {
    value: `emoji:${emoji}`,
    label,
    keywords,
    kind: "emoji",
    emoji,
  };
}
