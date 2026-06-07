import { describe, expect, it } from "@jest/globals";

import { Habit, HabitLog } from "@/features/habits/types";

import { buildHabitReport } from "./calculations";

const habit: Habit = {
  id: "habit-running",
  name: "Running",
  icon: "🏃",
  baseAmount: 100,
  unit: "m",
  startDate: "2026-06-01",
  reminderEnabled: false,
  stayModeEnabled: false,
  createdAt: "2026-06-01T05:00:00.000Z",
  updatedAt: "2026-06-01T05:00:00.000Z",
};

function log(
  localDate: string,
  levelSequencePosition: number,
  level: number,
  plannedAmount: number,
): HabitLog {
  return {
    id: `log-${localDate}`,
    habitId: habit.id,
    localDate,
    levelSequencePosition,
    level,
    plannedAmount,
    createdAt: `${localDate}T05:00:00.000Z`,
    updatedAt: `${localDate}T05:00:00.000Z`,
  };
}

describe("report calculations", () => {
  it("builds done-focused report metrics without storing missed days", () => {
    const report = buildHabitReport(
      habit,
      [
        log("2026-06-01", 0, 0, 0),
        log("2026-06-02", 1, 1, 100),
        log("2026-06-04", 2, 1, 100),
        log("2026-06-05", 3, 2, 200),
        log("2026-06-06", 3, 2, 200),
      ],
      "2026-06-06",
    );

    expect(report.totalDoneDays).toBe(5);
    expect(report.latestStreak).toBe(3);
    expect(report.bestStreak).toBe(3);
    expect(report.cumulativeAmount).toBe(600);
    expect(report.cumulativeAmountPoints.at(-1)).toMatchObject({
      localDate: "2026-06-06",
      amount: 600,
      totalDoneDays: 5,
    });
  });

  it("keeps today unmarked from breaking the latest streak when yesterday was done", () => {
    const report = buildHabitReport(
      habit,
      [log("2026-06-04", 2, 1, 100), log("2026-06-05", 3, 2, 200)],
      "2026-06-06",
    );

    expect(report.latestStreak).toBe(2);
  });

  it("builds month grid and cumulative chart points for done days", () => {
    const report = buildHabitReport(
      habit,
      [
        log("2026-06-01", 0, 0, 0),
        log("2026-06-02", 1, 1, 100),
        log("2026-06-03", 2, 1, 100),
        log("2026-06-04", 3, 2, 200),
      ],
      "2026-06-10",
    );

    expect(report.monthLabel).toBe("June 2026");
    expect(report.monthGridDays).toHaveLength(35);
    expect(
      report.monthGridDays.find((day) => day.localDate === "2026-06-03"),
    ).toMatchObject({
      isDone: true,
      dayOfMonth: 3,
    });
    expect(report.cumulativeAmountPoints).toEqual([
      {
        localDate: "2026-06-01",
        label: "1",
        amount: 0,
        totalDoneDays: 1,
      },
      {
        localDate: "2026-06-02",
        label: "2",
        amount: 100,
        totalDoneDays: 2,
      },
      {
        localDate: "2026-06-03",
        label: "3",
        amount: 200,
        totalDoneDays: 3,
      },
      {
        localDate: "2026-06-04",
        label: "4",
        amount: 400,
        totalDoneDays: 4,
      },
    ]);
  });

  it("counts stay mode done logs in reports", () => {
    const report = buildHabitReport(
      habit,
      [
        log("2026-06-01", 0, 0, 0),
        log("2026-06-02", 1, 1, 100),
        {
          ...log("2026-06-03", 2, 1, 100),
          countsTowardProgress: false,
        },
      ],
      "2026-06-03",
    );

    expect(report.totalDoneDays).toBe(3);
    expect(report.latestStreak).toBe(3);
    expect(report.cumulativeAmount).toBe(200);
    expect(report.cumulativeAmountPoints.at(-1)).toMatchObject({
      localDate: "2026-06-03",
      amount: 200,
      totalDoneDays: 3,
    });
  });

  it("builds the selected month grid independently from cumulative totals", () => {
    const report = buildHabitReport(
      habit,
      [
        log("2026-06-01", 0, 0, 0),
        log("2026-06-28", 1, 1, 100),
        log("2026-07-02", 2, 1, 100),
      ],
      "2026-07-05",
      "2026-06-01",
    );

    expect(report.monthLabel).toBe("June 2026");
    expect(
      report.monthGridDays.find((day) => day.localDate === "2026-06-28"),
    ).toMatchObject({
      isDone: true,
      dayOfMonth: 28,
    });
    expect(report.cumulativeAmountPoints.at(-1)).toMatchObject({
      localDate: "2026-07-02",
      amount: 200,
    });
  });
});
