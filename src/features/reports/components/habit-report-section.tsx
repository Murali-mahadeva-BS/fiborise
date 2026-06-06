import { Award, Flame, TrendingUp } from 'lucide-react-native';
import { Dimensions, Text, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';

import { Card } from '@/components/ui/card';
import { HabitReport } from '@/features/reports/types';
import { formatDisplayDate } from '@/lib/dates';
import { formatTargetAmount } from '@/lib/levels';

type HabitReportSectionProps = {
  report: HabitReport;
  unit: string;
};

const chartWidth = Math.min(Dimensions.get('window').width - 92, 320);
const weekDayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function HabitReportSection({ report, unit }: HabitReportSectionProps) {
  const weeklyBarData = report.weeklyDone.map((point, index) => ({
    value: point.doneDays,
    label: index % 2 === 0 ? point.label : '',
    frontColor: '#3f7657',
  }));
  const cumulativeLineData = report.cumulativeAmountPoints.map((point, index) => ({
    value: point.amount,
    label: index === 0 || index === report.cumulativeAmountPoints.length - 1 ? point.label : '',
  }));
  const cumulativeChartData =
    cumulativeLineData.length > 0 ? cumulativeLineData : [{ value: 0, label: '' }];

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
        <Text className="text-lg font-semibold text-charcoal-950 dark:text-sage-50">
          {report.monthLabel}
        </Text>
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
                    ? 'bg-moss-700'
                    : day.isFuture || !day.isInMonth
                      ? 'bg-sage-100 dark:bg-charcoal-900'
                      : 'bg-sage-200 dark:bg-charcoal-800'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    day.isDone
                      ? 'text-sage-50'
                      : day.isInMonth
                        ? 'text-charcoal-600 dark:text-sage-200'
                        : 'text-charcoal-600/40 dark:text-sage-200/40'
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
          Weekly done days
        </Text>
        <BarChart
          data={weeklyBarData}
          width={chartWidth}
          height={130}
          maxValue={7}
          noOfSections={7}
          barWidth={16}
          spacing={12}
          initialSpacing={4}
          endSpacing={4}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor="#cfe3c9"
          hideRules
          yAxisTextStyle={{ color: '#5a665e', fontSize: 10 }}
          xAxisLabelTextStyle={{ color: '#5a665e', fontSize: 9 }}
          disableScroll
          roundedTop
          roundedBottom
        />
      </View>

      <View className="gap-3">
        <Text className="text-lg font-semibold text-charcoal-950 dark:text-sage-50">
          Cumulative amount
        </Text>
        <LineChart
          data={cumulativeChartData}
          width={chartWidth}
          height={130}
          color="#315c45"
          thickness={3}
          areaChart
          startFillColor="#b7d2a8"
          endFillColor="#e9f3e6"
          startOpacity={0.8}
          endOpacity={0.2}
          dataPointsColor="#315c45"
          dataPointsRadius={3}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor="#cfe3c9"
          rulesColor="#e9f3e6"
          yAxisTextStyle={{ color: '#5a665e', fontSize: 10 }}
          xAxisLabelTextStyle={{ color: '#5a665e', fontSize: 9 }}
          noOfSections={4}
          disableScroll
        />
      </View>

      <View className="gap-3">
        <Text className="text-lg font-semibold text-charcoal-950 dark:text-sage-50">
          Level timeline
        </Text>
        {report.levelTimeline.length === 0 ? (
          <Text className="text-base leading-6 text-charcoal-600 dark:text-sage-200">
            No done days yet.
          </Text>
        ) : (
          <View className="gap-2">
            {report.levelTimeline.slice(-6).map((item) => (
              <View
                key={`${item.localDate}-${item.level}-${item.plannedAmount}`}
                className="flex-row items-center justify-between rounded-2xl bg-sage-100 px-4 py-3 dark:bg-charcoal-800"
              >
                <View>
                  <Text className="text-base font-semibold text-charcoal-950 dark:text-sage-50">
                    Level {item.level}
                  </Text>
                  <Text className="text-sm text-charcoal-600 dark:text-sage-200">
                    {formatDisplayDate(item.localDate)}
                  </Text>
                </View>
                <Text className="text-base font-semibold text-moss-700 dark:text-moss-200">
                  {item.level === 0
                    ? 'Just mark done'
                    : `${formatTargetAmount(item.plannedAmount)} ${unit}`}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Card>
  );
}

function ReportMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
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
      <Text className="text-xl font-bold text-charcoal-950 dark:text-sage-50">{value}</Text>
    </View>
  );
}
