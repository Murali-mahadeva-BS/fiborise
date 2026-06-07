import { Search } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import {
  filterHabitIconOptions,
  HabitIconGlyph,
  normalizeHabitIconValue,
} from "./icons";

type HabitIconPickerProps = {
  value: string;
  onChange: (value: string) => void;
};

const iconColumns = 7;
const iconRows = 7;
const iconsPerPage = iconColumns * iconRows;
const iconButtonGap = 6;

export function HabitIconPicker({ value, onChange }: HabitIconPickerProps) {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const normalizedValue = normalizeHabitIconValue(value);
  const filteredIcons = useMemo(() => filterHabitIconOptions(query), [query]);
  const iconPages = useMemo(
    () => chunkIcons(filteredIcons, iconsPerPage),
    [filteredIcons],
  );
  const iconGridWidth = Math.max(1, width - 80);
  const iconButtonSize = Math.max(
    1,
    Math.floor(
      (iconGridWidth - iconButtonGap * (iconColumns - 1)) / iconColumns,
    ),
  );
  const iconGridHeight =
    iconButtonSize * iconRows + iconButtonGap * (iconRows - 1);

  useEffect(() => {
    setCurrentPage(0);
    scrollViewRef.current?.scrollTo({ x: 0, animated: false });
  }, [query, iconGridWidth]);

  const handleScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const nextPage = Math.round(
      event.nativeEvent.contentOffset.x / iconGridWidth,
    );
    setCurrentPage(Math.min(Math.max(nextPage, 0), iconPages.length - 1));
  };

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between gap-4">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-charcoal-700 dark:text-sage-100">
            Icon
          </Text>
          <Text className="mt-1 text-sm text-charcoal-600 dark:text-sage-200">
            Search and choose from all available icons and emojis.
          </Text>
        </View>
        <View className="h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sage-100 dark:bg-charcoal-800">
          <HabitIconGlyph value={normalizedValue} size={22} />
        </View>
      </View>

      <View className="min-h-12 flex-row items-center gap-3 rounded-2xl border border-sage-200 bg-white px-4 dark:border-charcoal-700 dark:bg-charcoal-900">
        <Search size={18} color="#5a665e" />
        <TextInput
          value={query}
          placeholder="Search running, reading, sleep..."
          placeholderTextColor="#5a665e"
          className="min-h-12 flex-1 py-0 text-base text-charcoal-950 dark:text-sage-50"
          onChangeText={setQuery}
        />
      </View>

      {filteredIcons.length === 0 ? (
        <Text className="text-base leading-6 text-charcoal-600 dark:text-sage-200">
          No icon matches that search yet.
        </Text>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ width: iconGridWidth }}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
        >
          {iconPages.map((page, pageIndex) => (
            <View
              key={`icon-page-${pageIndex}`}
              className="flex-row flex-wrap"
              style={{
                gap: iconButtonGap,
                height: iconGridHeight,
                width: iconGridWidth,
              }}
            >
              {page.map((option) => {
                const selected = normalizedValue === option.value;

                return (
                  <Pressable
                    key={option.value}
                    className={`items-center justify-center rounded-xl border ${
                      selected
                        ? "border-moss-700 bg-moss-700"
                        : "border-sage-200 bg-sage-50 dark:border-charcoal-700 dark:bg-charcoal-800"
                    }`}
                    style={{ height: iconButtonSize, width: iconButtonSize }}
                    accessibilityRole="button"
                    accessibilityLabel={`Use ${option.label} icon`}
                    onPress={() => onChange(option.value)}
                  >
                    <HabitIconGlyph
                      value={option.value}
                      size={18}
                      color={selected ? "#f7fbf6" : "#315c45"}
                    />
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}

      {iconPages.length > 1 ? (
        <View className="flex-row justify-center gap-2">
          {iconPages.map((_, pageIndex) => (
            <View
              key={`icon-page-indicator-${pageIndex}`}
              className={`h-1.5 rounded-full ${
                pageIndex === currentPage ? "bg-moss-700" : "bg-sage-200"
              }`}
              style={{ width: pageIndex === currentPage ? 18 : 6 }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function chunkIcons<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}
