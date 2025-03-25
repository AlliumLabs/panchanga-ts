import {
  calculatePanchanga,
  PanchangaInput,
  PanchangaResponse,
} from "../index";

describe("calculatePanchanga", () => {
  // Test with a city name
  test("should calculate panchanga for a known city", async () => {
    const input: PanchangaInput = {
      city: "Mumbai",
      date: new Date().toISOString(),
    };

    const result = await calculatePanchanga(input);
    console.log({
      result,
    });
    // Verify the response structure
    expect(result).toBeDefined();
    expect(result.tithi).toBeDefined();
    expect(result.nakshatra).toBeDefined();
    expect(result.yoga).toBeDefined();
    expect(result.karana).toBeDefined();
    expect(result.vaara).toBeDefined();
    expect(result.masa).toBeDefined();
    expect(result.ritu).toBeDefined();
    expect(result.sunrise).toBeDefined();
    expect(result.sunset).toBeDefined();
  });

  // Test with latitude, longitude, timezone
  //   test("should calculate panchanga using coordinates", async () => {
  //     const input: PanchangaInput = {
  //       latitude: 19.076,
  //       longitude: 72.8777,
  //       timezone: 5.5,
  //       date: "2023-10-15",
  //     };

  //     const result = await calculatePanchanga(input);

  //     // Verify the response structure
  //     expect(result).toBeDefined();
  //     expect(result.tithi.value).toBeTruthy();
  //     expect(result.nakshatra.value).toBeTruthy();
  //     expect(result.yoga.value).toBeTruthy();
  //   });

  // Test error handling - unknown city
  test("should throw error for unknown city", async () => {
    const input: PanchangaInput = {
      city: "NonExistentCity",
      date: "2023-10-15",
    };

    await expect(calculatePanchanga(input)).rejects.toThrow(
      "City 'NonExistentCity' not found in database."
    );
  });

  // Test error handling - missing required parameters
  test("should throw error for missing parameters", async () => {
    const input = {
      date: "2023-10-15",
    } as PanchangaInput;

    await expect(calculatePanchanga(input)).rejects.toThrow(
      "Missing required geographical parameters."
    );
  });
});
