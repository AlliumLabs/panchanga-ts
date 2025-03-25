import { AstroTime, Observer } from "astronomy-engine";
import { computeMasa, computeRitu } from "../../calculations/masa";

describe("Masa Calculations", () => {
  // Setup a standard observer for tests (Bangalore, India)
  const observer: Observer = new Observer(
    12.9716,
    77.5946,
    920 // meters above sea level
  );

  test("correctly calculates masa for a given time and observer", () => {
    // Use a specific date for testing
    const date = new Date(2023, 0, 15, 6, 0, 0); // January 15, 2023, 6:00 AM local time
    const time = new AstroTime(date);

    const result = computeMasa(time, observer);

    // Basic validity checks
    expect(typeof result.masa).toBe("number");
    expect(result.masa).toBeGreaterThanOrEqual(1);
    expect(result.masa).toBeLessThanOrEqual(12);
    expect(typeof result.isLeap).toBe("boolean");
  });

  test("ensures the masa index is always between 1 and 12", () => {
    const testDates = [
      new AstroTime(new Date(2023, 0, 15, 6, 0, 0)),
      new AstroTime(new Date(2023, 3, 15, 6, 0, 0)),
      new AstroTime(new Date(2023, 6, 15, 6, 0, 0)),
      new AstroTime(new Date(2023, 9, 15, 6, 0, 0)),
    ];

    for (const date of testDates) {
      const result = computeMasa(date, observer);
      expect(result.masa).toBeGreaterThanOrEqual(1);
      expect(result.masa).toBeLessThanOrEqual(12);
    }
  });

  test("correctly calculates ritu from masa", () => {
    // Test for all possible masa values
    for (let masa = 1; masa <= 12; masa++) {
      const ritu = computeRitu(masa);
      expect(ritu).toBeGreaterThanOrEqual(0);
      expect(ritu).toBeLessThanOrEqual(5);
      
      // Verify correct ritu calculation
      const expectedRitu = Math.floor((masa - 1) / 2);
      expect(ritu).toBe(expectedRitu);
    }
  });
  
  test("handles leap masa detection appropriately", () => {
    // Note: Testing for a leap masa would ideally use dates known to have leap months
    // This is a basic test structure, but actual leap months would need specific dates
    const testDates = [
      new AstroTime(new Date(2023, 0, 15, 6, 0, 0)),
      new AstroTime(new Date(2023, 3, 15, 6, 0, 0)),
      new AstroTime(new Date(2023, 6, 15, 6, 0, 0)),
      new AstroTime(new Date(2023, 9, 15, 6, 0, 0)),
    ];

    for (const date of testDates) {
      const result = computeMasa(date, observer);
      // Simply check that the isLeap property is a boolean
      expect(typeof result.isLeap).toBe("boolean");
    }
  });
});
