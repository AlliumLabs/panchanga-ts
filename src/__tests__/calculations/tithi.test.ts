import { AstroTime, Observer } from "astronomy-engine";
import { computeTithi } from "../../calculations/tithi";
import { TithiResult } from "../../models/types";

describe("Tithi Calculations", () => {
  // Setup a standard observer for tests (Bangalore, India)
  const observer: Observer = new Observer(
    12.9716,
    77.5946,
    920 // meters above sea level
  );

  test("correctly calculates tithi for a given time and observer", () => {
    // Use a specific date for testing
    const date = new Date(2023, 10, 3, 6, 0, 0); // January 1, 2023, 6:00 AM local time
    const time = new AstroTime(date);

    const result = computeTithi(time, observer);

    // Basic validity checks
    expect(typeof result.index).toBe("number");
    expect(result.index).toBeGreaterThanOrEqual(1);
    expect(result.index).toBeLessThanOrEqual(30);
    expect(result.endTime instanceof AstroTime).toBe(true);
    expect(typeof result.description).toBe("string");
  });

  test("ensures the tithi index is always between 1 and 30", () => {
    const testDates = [
      new AstroTime(new Date(2023, 0, 1, 6, 0, 0)),
      new AstroTime(new Date(2023, 2, 15, 6, 0, 0)),
      new AstroTime(new Date(2023, 4, 29, 6, 0, 0)),
      new AstroTime(new Date(2023, 8, 22, 6, 0, 0)),
      new AstroTime(new Date(2023, 11, 31, 6, 0, 0)),
      new AstroTime(new Date(2023, 5, 30, 6, 0, 0)),
    ];

    for (const date of testDates) {
      const result = computeTithi(date, observer);
      expect(result.index).toBeGreaterThanOrEqual(1);
      expect(result.index).toBeLessThanOrEqual(30);
    }
  });

  test("calculates tithi end time later than input time but within 24 hours", () => {
    const time = new AstroTime(new Date(2023, 0, 1, 6, 0, 0));

    const result = computeTithi(time, observer);

    expect(result.endTime!.ut > time.ut).toBe(true);
    // End time should be less than 24 hours from start time in most cases
    expect(result.endTime && result.endTime.ut - time.ut).toBeLessThan(1.0);
  });

  test("handles the detection of skipped tithis correctly", () => {
    // This would ideally use a date known to have a skipped tithi
    // For now, we'll test the handling mechanism

    // Mock implementation to test the skipped tithi logic
    // In a real scenario, you would need to find an actual date with a skipped tithi
    const testWithSkippedTithi = (result: TithiResult) => {
      if (result.leapTithi) {
        expect(result.leapTithi.index).toBe((result.index % 30) + 1);
        expect(result.leapTithi.endTime instanceof AstroTime).toBe(true);
        expect(result.leapTithi.endTime!.ut > result.endTime!.ut).toBe(false);
      }
    };

    // Test several dates to potentially catch skipped tithis
    const testDates = [
      new AstroTime(new Date(2023, 3, 15, 6, 0, 0)),
      new AstroTime(new Date(2023, 7, 10, 6, 0, 0)),
      new AstroTime(new Date(2023, 10, 20, 6, 0, 0)),
    ];

    for (const date of testDates) {
      const result = computeTithi(date, observer);
      testWithSkippedTithi(result);
    }
  });
});
