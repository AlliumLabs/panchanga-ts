// panchanga.ts
import { AstroTime, Observer } from "astronomy-engine";
import sanskritNames from "./data/sanskrit_names";
import cities from "./data/cities";
import { Place, PanchangaInput, PanchangaResponse } from "./models/types";
import {
  getJulianDay,
  astroTimeToISOString,
  astroTimeToLocalTimeString,
  parseInputDate,
} from "./utils/helpers";
import {
  computeTithi,
  computeNakshatra,
  computeYoga,
  computeKarana,
  computeVaara,
  computeMasa,
  computeRitu,
  computeAhargana,
  computeElapsedYear,
  computeSamvatsara,
  computeDayDuration,
  calculateSunTimes,
} from "./calculations";

const tithis = sanskritNames.tithis;
const nakshatras = sanskritNames.nakshatras;
const vaaras = sanskritNames.varas;
const yogas = sanskritNames.yogas;
const karanas = sanskritNames.karanas;
const masas = sanskritNames.masas;
const samvats = sanskritNames.samvats;
const ritus = sanskritNames.ritus;

// --- Main Function ---
// This is the simple function call that wraps the Panchānga calculations.
export async function calculatePanchanga(
  input: PanchangaInput
): Promise<PanchangaResponse> {
  // Determine the Place based on input.
  let place: Place;
  if (input.city) {
    const toTitleCase = (str: string) =>
      str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
    const cityName = toTitleCase(input.city) as keyof typeof cities;
    if (cities[cityName]) {
      const cityData = cities[cityName];
      place = {
        latitude: cityData.latitude,
        longitude: cityData.longitude,
        timezone: cityData.timezone,
      };
    } else {
      throw new Error(`City '${input.city}' not found in database.`);
    }
  } else if (
    input.latitude !== undefined &&
    input.longitude !== undefined &&
    input.timezone !== undefined
  ) {
    place = {
      latitude: Number(input.latitude),
      longitude: Number(input.longitude),
      timezone: input.timezone,
    };
  } else {
    throw new Error("Missing required geographical parameters.");
  }

  // Parse date
  const inputDate = parseInputDate(input.date);

  // Create an AstroTime for local midnight of the given date.
  const localMidnight = new Date(
    Date.UTC(
      inputDate.getUTCFullYear(),
      inputDate.getUTCMonth(),
      inputDate.getUTCDate()
    )
  );
  // Adjust to UT using the timezone offset.
  const adjustedUT = new Date(
    localMidnight.getTime() - Number(place.timezone) * 3600000
  );
  const utTime = new AstroTime(adjustedUT);
  const observer = new Observer(place.latitude, place.longitude, 0);

  // Calculate sunrise and sunset times
  const { sunriseTime, sunsetTime } = calculateSunTimes(utTime, observer);

  // Compute Panchānga elements.
  const tithiData = computeTithi(sunriseTime, observer);
  const nakData = await computeNakshatra(sunriseTime, observer);
  const yogaData = await computeYoga(sunriseTime, observer);
  const karanaData = computeKarana(sunriseTime, observer);
  const vaaraData = computeVaara(sunriseTime, place.timezone);
  const masaData = computeMasa(sunriseTime, observer);
  const rituNum = computeRitu(masaData.masa);
  const julianDay = getJulianDay(sunriseTime.date);
  const aharganaNum = computeAhargana(julianDay);
  const { kali, saka } = computeElapsedYear(julianDay, masaData.masa);
  const samvatNum = computeSamvatsara(julianDay, masaData.masa);
  const dayDuration = computeDayDuration(sunriseTime, sunsetTime);

  // Build and return the Panchānga response.
  return {
    tithi: {
      value: tithis[tithiData.index] || `Tithi ${tithiData.index}`,
      start: astroTimeToISOString(sunriseTime, place.timezone),
      end: tithiData.endTime
        ? astroTimeToISOString(tithiData.endTime, place.timezone)
        : undefined,
      description: tithiData.description,
    },
    nakshatra: {
      value: nakshatras[nakData.index] || `Nakṣatra ${nakData.index}`,
      start: astroTimeToISOString(sunriseTime, place.timezone),
      end: nakData.endTime
        ? astroTimeToISOString(nakData.endTime, place.timezone)
        : undefined,
      description: nakData.description,
    },
    yoga: {
      value: yogas[yogaData.index] || `Yoga ${yogaData.index}`,
      start: astroTimeToISOString(sunriseTime, place.timezone),
      end: yogaData.endTime
        ? astroTimeToISOString(yogaData.endTime, place.timezone)
        : undefined,
      description: yogaData.description,
    },
    karana: {
      value: karanas[karanaData.index] || `Karaṇa ${karanaData.index}`,
      start: astroTimeToISOString(sunriseTime, place.timezone),
      end: astroTimeToISOString(sunriseTime, place.timezone),
      description: karanaData.description,
    },
    vaara: {
      value: vaaras[vaaraData.index] || `Vaara ${vaaraData.index}`,
      start: astroTimeToISOString(sunriseTime, place.timezone),
      end: astroTimeToISOString(sunriseTime, place.timezone),
      description: vaaraData.description,
    },
    masa: {
      value:
        (masaData.isLeap ? "Adhika " : "") +
        (masas[masaData.masa] || `Māsa ${masaData.masa}`),
      description:
        "Māsa signifies the lunar month as determined by the interval between new moons. A leap month (Adhika Māsa) occurs when the Sun remains in the same zodiac sign across successive new moons.",
    },
    ritu: {
      value: ritus[rituNum] || `Ṛtu ${rituNum}`,
      description:
        "Ṛtu (season) divides the year into six segments, reflecting nature's cyclic changes celebrated in numerous Hindu festivals.",
    },
    ahargana: {
      value: Math.floor(aharganaNum).toString(),
      description:
        "Ahargaṇa is the count of days since the beginning of Kali Yuga, representing the cosmic passage of time in Hindu cosmology.",
    },
    elapsed_year: {
      kali,
      saka,
      description:
        "Elapsed Year represents the number of years passed in the Kali and Śālivāhana Śaka eras, integral to traditional Hindu timekeeping.",
    },
    samvatsara: {
      value: samvats[samvatNum] || `Samvatsara ${samvatNum}`,
      description:
        "Samvatsara is the name of the year in the 60-year cycle, each bearing its own mythological and astrological significance.",
    },
    sunrise: {
      value: astroTimeToLocalTimeString(sunriseTime, place.timezone),
      description:
        "Sunrise is revered as a sacred time that marks the beginning of the day and the renewal of spiritual energy.",
    },
    sunset: {
      value: astroTimeToLocalTimeString(sunsetTime, place.timezone),
      description:
        "Sunset signals the end of the day and is a time for reflection, prayer, and letting go in the Hindu tradition.",
    },
    day_duration: {
      value: dayDuration.formatted,
      description:
        "Day Duration is the total span of daylight, important for scheduling rituals and daily observances in accordance with natural cycles.",
    },
  };
}

export { PanchangaInput, PanchangaResponse };
