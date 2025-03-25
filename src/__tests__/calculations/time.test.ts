import { AstroTime, Observer } from "astronomy-engine";
import {
  computeVaara,
  computeDayDuration,
  calculateSunTimes,
} from "../../calculations/time";
import { adjustTimeByTimezone } from "../../utils/helpers";

describe("Time Calculations", () => {
  // Setup a standard observer for tests (Bangalore, India)
  const observer: Observer = new Observer(
    12.9716,
    77.5946,
    920 // meters above sea level
  );

  test("correctly calculates vaara (weekday) for a given time", () => {
    // Test for known weekdays
    const testCases = [
      { date: new Date(2023, 0, 1), expected: 0 }, // Sunday (Jan 1, 2023)
      { date: new Date(2023, 0, 2), expected: 1 }, // Monday
      { date: new Date(2023, 0, 7), expected: 6 }, // Saturday
    ];

    for (const { date, expected } of testCases) {
      const time = new AstroTime(date);
      const result = computeVaara(time);
      expect(result.index).toBe(expected);
      expect(typeof result.time).toBe("string");
      expect(typeof result.description).toBe("string");
    }
  });

  test("correctly calculates day duration between sunrise and sunset", () => {
    // Create sample sunrise and sunset times
    const sunriseDate = new Date(2023, 0, 1, 6, 30, 0); // 6:30 AM
    const sunsetDate = new Date(2023, 0, 1, 18, 0, 0); // 6:00 PM
    const sunriseTime = new AstroTime(sunriseDate);
    const sunsetTime = new AstroTime(sunsetDate);

    const result = computeDayDuration(sunriseTime, sunsetTime);

    // Expected duration is 11.5 hours
    expect(result.duration).toBeCloseTo(11.5, 1);
    expect(typeof result.formatted).toBe("string");
    expect(result.formatted).toBe("11:30:00");
  });

  test("calculates sun times correctly for a given location and date", () => {
    const date = new Date(); // Jan 1, 2023, noon
    const adjustedDate = adjustTimeByTimezone(date, "Asia/Kolkata");
    const time = new AstroTime(adjustedDate);

    const result = calculateSunTimes(time, observer);

    // Basic validity checks
    expect(result.sunriseTime).toBeDefined();
    expect(result.sunsetTime).toBeDefined();
    expect(result.sunriseTime instanceof AstroTime).toBe(true);
    expect(result.sunsetTime instanceof AstroTime).toBe(true);

    // Sunrise should be before sunset on the same day
    expect(result.sunriseTime.ut < result.sunsetTime.ut).toBe(true);

    // Sunrise should be in the morning and sunset in the evening
    const srHour = result.sunriseTime.date.getUTCHours();
    const ssHour = result.sunsetTime.date.getUTCHours();
    expect(srHour).toBeLessThan(12);
    expect(ssHour).toBeGreaterThanOrEqual(12);
  });
});
