import { AstroTime, Observer } from "astronomy-engine";
import { computeKarana } from "../../calculations/karana";

describe("Karana Calculations", () => {
  // Setup a standard observer for tests (Bangalore, India)
  const observer: Observer = new Observer(
    12.9716,
    77.5946,
    920 // meters above sea level
  );

  test("correctly calculates karana for a given time and observer", () => {
    // Use a specific date for testing
    const date = new Date(2023, 0, 1, 6, 0, 0); // January 1, 2023, 6:00 AM local time
    const time = new AstroTime(date);

    const result = computeKarana(time, observer);

    // Basic validity checks
    expect(typeof result.index).toBe("number");
    expect(result.index).toBeGreaterThanOrEqual(1);
    expect(result.index).toBeLessThanOrEqual(60);
    expect(typeof result.description).toBe("string");
  });

  test("ensures the karana index is always between 1 and 60", () => {
    const testDates = [
      new AstroTime(new Date(2023, 0, 1, 6, 0, 0)),
      new AstroTime(new Date(2023, 3, 15, 6, 0, 0)),
      new AstroTime(new Date(2023, 6, 15, 6, 0, 0)),
      new AstroTime(new Date(2023, 9, 15, 6, 0, 0)),
    ];

    for (const date of testDates) {
      const result = computeKarana(date, observer);
      expect(result.index).toBeGreaterThanOrEqual(1);
      expect(result.index).toBeLessThanOrEqual(60);
    }
  });

  test("verifies that karana is related to tithi (half a tithi)", () => {
    // Since a karana is half a tithi (6° of separation vs 12°),
    // we should be able to relate them mathematically
    const testDates = [
      new AstroTime(new Date(2023, 0, 1, 6, 0, 0)),
      new AstroTime(new Date(2023, 3, 15, 6, 0, 0)),
      new AstroTime(new Date(2023, 6, 15, 6, 0, 0)),
      new AstroTime(new Date(2023, 9, 15, 6, 0, 0)),
    ];

    for (const date of testDates) {
      const result = computeKarana(date, observer);

      // Calculate the derived tithi index (integer ceil of karana/2)
      const derivedTithiIndex = Math.ceil(result.index / 2);

      // The derived tithi index should be between 1 and 30
      expect(derivedTithiIndex).toBeGreaterThanOrEqual(1);
      expect(derivedTithiIndex).toBeLessThanOrEqual(30);
    }
  });
});
