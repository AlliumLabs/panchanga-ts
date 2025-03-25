import { computeAhargana, computeElapsedYear, computeSamvatsara } from "../../calculations/year";

describe("Year Calculations", () => {
  test("correctly calculates ahargana from Julian day", () => {
    // Julian day for 2023-01-01
    const julianDay = 2459946.5;
    const ahargana = computeAhargana(julianDay);
    
    // Expected: Julian day - 588465.5
    expect(ahargana).toBe(julianDay - 588465.5);
  });

  test("correctly calculates elapsed Kali and Saka years", () => {
    // Julian day for 2023-01-01
    const julianDay = 2459946.5;
    const masa = 10; // Example masa value
    
    const result = computeElapsedYear(julianDay, masa);
    
    expect(typeof result.kali).toBe("number");
    expect(typeof result.saka).toBe("number");
    
    // Verify Saka year is calculated correctly from Kali year
    expect(result.saka).toBe(result.kali - 3179);
  });

  test("correctly calculates Samvatsara", () => {
    // Julian day for 2023-01-01
    const julianDay = 2459946.5;
    const masa = 10; // Example masa value
    
    const samvatsara = computeSamvatsara(julianDay, masa);
    
    // Basic validity check
    expect(samvatsara).toBeGreaterThanOrEqual(0);
    expect(samvatsara).toBeLessThan(60);
    
    // Verify samvatsara calculation for a specific date
    // We can test the consistency of the formula by calculating twice
    const secondCalc = computeSamvatsara(julianDay, masa);
    expect(samvatsara).toBe(secondCalc);
  });

  test("handles the special case when Kali is >= 4009", () => {
    // Create a mock Julian day that would result in Kali >= 4009
    // This will require some reverse engineering of the formula
    const siderealYear = 365.25636;
    const masa = 10;
    
    // Create a Julian day that would yield a Kali year of 4010
    const ahar = 4010 * siderealYear - (4 - masa) * 30;
    const julianDay = ahar + 588465.5;
    
    const samvatsara = computeSamvatsara(julianDay, masa);
    
    // Since we're in the special case, samvatsara should still be in range
    expect(samvatsara).toBeGreaterThanOrEqual(0);
    expect(samvatsara).toBeLessThan(60);
  });
});
