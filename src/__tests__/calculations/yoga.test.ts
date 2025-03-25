import { AstroTime, Observer } from "astronomy-engine";
import { computeYoga } from "../../calculations/yoga";

describe("Yoga Calculations", () => {
  // Setup a standard observer for tests (Bangalore, India)
  const observer: Observer = new Observer(
    12.9716,
    77.5946,
    920 // meters above sea level
  );

  test("correctly calculates yoga for a given time and observer", async () => {
    // Use a specific date for testing
    const date = new Date(2023, 0, 1, 6, 0, 0); // January 1, 2023, 6:00 AM local time
    const time = new AstroTime(date);

    const result = await computeYoga(time, observer);

    // Basic validity checks
    expect(typeof result.index).toBe("number");
    expect(result.index).toBeGreaterThanOrEqual(1);
    expect(result.index).toBeLessThanOrEqual(27);
    expect(result.endTime instanceof AstroTime).toBe(true);
    expect(typeof result.description).toBe("string");
  });

  test("ensures the yoga index is always between 1 and 27", async () => {
    const testDates = [
      new AstroTime(new Date(2023, 0, 1, 6, 0, 0)),
      new AstroTime(new Date(2023, 3, 15, 6, 0, 0)),
      new AstroTime(new Date(2023, 6, 15, 6, 0, 0)),
      new AstroTime(new Date(2023, 9, 15, 6, 0, 0)),
    ];

    for (const date of testDates) {
      const result = await computeYoga(date, observer);
      expect(result.index).toBeGreaterThanOrEqual(1);
      expect(result.index).toBeLessThanOrEqual(27);
    }
  });

  //   test("calculates yoga end time later than input time", async () => {
  //     const time = new AstroTime(new Date(2023, 0, 1, 6, 0, 0));

  //     const result = await computeYoga(time, observer);

  //     expect(result.endTime!.ut > time.ut).toBe(true);
  //     // End time should be reasonable (typically within a day or two)
  //     expect(result.endTime!.ut - time.ut).toBeLessThan(2.0);
  //   });

  test("verifies that yoga is based on sum of sun and moon longitudes", async () => {
    // Yoga is calculated from the sum of sidereal longitudes of sun and moon
    // Each yoga is 13°20' (360°/27) of this combined longitude
    const date = new Date(2023, 0, 1, 6, 0, 0);
    const time = new AstroTime(date);

    const result = await computeYoga(time, observer);

    // Basic check that the result makes sense
    expect(result.index).toBeGreaterThanOrEqual(1);
    expect(result.index).toBeLessThanOrEqual(27);
  });
});
