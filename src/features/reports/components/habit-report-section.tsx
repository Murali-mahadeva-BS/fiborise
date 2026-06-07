import { ReactNode } from "react";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Flame,
  TrendingUp,
} from "lucide-react-native";
import { Dimensions, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HabitReport } from "@/features/reports/types";
import { formatTargetAmount } from "@/lib/levels";

type HabitReportSectionProps = {
  report: HabitReport;
  unit: string;
  canGoToPreviousMonth: boolean;
  canGoToNextMonth: boolean;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

const chartWidth = Math.min(Dimensions.get("window").width - 128, 300);
const weekDayLabels = ["M", "T", "W", "T", "F", "S", "S"];

export function HabitReportSection({
  report,
  unit,
  canGoToPreviousMonth,
  canGoToNextMonth,
  onPreviousMonth,
  onNextMonth,
}: HabitReportSectionProps) {
  const chartData =
    report.cumulativeAmountPoints.length > 0
      ? report.cumulativeAmountPoints.map((point, index, points) => {
          const labelEvery = Math.max(Math.ceil(points.length / 6), 1);

          return {
            value: point.amount,
            label:
              index === 0 ||
              index === points.length - 1 ||
              index % labelEvery === 0
                ? point.label
                : "",
          };
        })
      : [{ value: 0, label: "" }];

  return (
    <Card className="gap-5">
      <View>
        <Text className="text-xl font-semibold text-charcoal-950 dark:text-sage-50">
          Reports
        </Text>
        <Text className="mt-1 text-base text-charcoal-600 dark:text-sage-200">
          Done days and growth so far.
        </Text>
      </View>

      <View className="flex-row gap-3">
        <ReportMetric
          icon={<Flame size={18} color="#315c45" />}
          label="Latest streak"
          value={`${report.latestStreak} days`}
        />
        <ReportMetric
          icon={<Award size={18} color="#315c45" />}
          label="Best streak"
          value={`${report.bestStreak} days`}
        />
      </View>

      <ReportMetric
        icon={<TrendingUp size={18} color="#315c45" />}
        label="Cumulative amount"
        value={`${formatTargetAmount(report.cumulativeAmount)} ${unit}`}
      />

      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-3">
          <Button
            variant="ghost"
            disabled={!canGoToPreviousMonth}
            className={!canGoToPreviousMonth ? "opacity-40" : ""}
            onPress={onPreviousMonth}
          >
            <ChevronLeft size={18} color="#315c45" />
          </Button>
          <Text className="text-lg font-semibold text-charcoal-950 dark:text-sage-50">
            {report.monthLabel}
          </Text>
          <Button
            variant="ghost"
            disabled={!canGoToNextMonth}
            className={!canGoToNextMonth ? "opacity-40" : ""}
            onPress={onNextMonth}
          >
            <ChevronRight size={18} color="#315c45" />
          </Button>
        </View>

        <View className="flex-row">
          {weekDayLabels.map((label, index) => (
            <Text
              key={`${label}-${index}`}
              className="text-center text-xs font-semibold text-charcoal-600 dark:text-sage-200"
              style={{ width: `${100 / 7}%` }}
            >
              {label}
            </Text>
          ))}
        </View>
        <View className="flex-row flex-wrap">
          {report.monthGridDays.map((day) => (
            <View
              key={day.localDate}
              className="p-1"
              style={{ width: `${100 / 7}%`, aspectRatio: 1 }}
            >
              <View
                className={`flex-1 items-center justify-center rounded-xl ${
                  day.isDone
                    ? "bg-moss-700"
                    : day.isFuture || !day.isInMonth
                      ? "bg-sage-100 dark:bg-charcoal-900"
                      : "bg-sage-200 dark:bg-charcoal-800"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    day.isDone
                      ? "text-sage-50"
                      : day.isInMonth
                        ? "text-charcoal-600 dark:text-sage-200"
                        : "text-charcoal-600/40 dark:text-sage-200/40"
                  }`}
                >
                  {day.dayOfMonth}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Text className="text-lg font-semibold text-charcoal-950 dark:text-sage-50">
          Cumulative amount
        </Text>
        <View className="pr-3">
          <LineChart
            data={chartData}
            width={chartWidth}
            height={180}
            color="#315c45"
            thickness={3}
            areaChart
            isAnimated
            animateOnDataChange
            startFillColor="#b7d2a8"
            endFillColor="#e9f3e6"
            startOpacity={0.75}
            endOpacity={0.18}
            dataPointsColor="#315c45"
            dataPointsRadius={4}
            yAxisThickness={0}
            xAxisThickness={1}
            xAxisColor="#cfe3c9"
            yAxisTextStyle={{ color: "#5a665e", fontSize: 10 }}
            xAxisLabelTextStyle={{ color: "#5a665e", fontSize: 9 }}
            noOfSections={4}
            hideRules
            hideDataPoints
            disableScroll
          />
        </View>
      </View>
    </Card>
  );
}

function ReportMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-1 gap-2 rounded-2xl bg-sage-100 p-4 dark:bg-charcoal-800">
      <View className="flex-row items-center gap-2">
        {icon}
        <Text className="text-sm font-semibold text-charcoal-600 dark:text-sage-200">
          {label}
        </Text>
      </View>
      <Text className="text-xl font-bold text-charcoal-950 dark:text-sage-50">
        {value}
      </Text>
    </View>
  );
}
