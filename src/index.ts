// panchanga.ts
import { AstroTime, Observer } from "astronomy-engine";
import sanskritNames from "./data/sanskrit_names";
import cities from "./data/cities";
import { Place, PanchangaInput, PanchangaResponse } from "./models/types";
import { getJulianDay, adjustToLocalTime } from "./utils/helpers";
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

  console.log({ place });
  // Parse date and adjust to local timezone
  const parsedDate = new Date(input.date);
  console.log({ parsedDate });
  const localDate = adjustToLocalTime(parsedDate, place.timezone);
  const utTime = new AstroTime(localDate);
  const observer = new Observer(place.latitude, place.longitude, 0);

  // Calculate sunrise and sunset times
  const { sunriseTime, sunsetTime } = calculateSunTimes(utTime, observer);
  // Compute Panchānga elements.
  const tithiData = computeTithi(sunriseTime, observer);
  const nakData = await computeNakshatra(sunriseTime, observer);
  const yogaData = await computeYoga(sunriseTime, observer);
  const karanaData = computeKarana(sunriseTime, observer);
  const vaaraData = computeVaara(sunriseTime);
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
      index: tithiData.index,
      value: tithis[tithiData.index] || `Tithi ${tithiData.index}`,
      start: sunriseTime.date.toISOString(),
      end: tithiData.endTime?.date.toISOString(),
      description: tithiData.description,
    },
    nakshatra: {
      index: nakData.index,
      value: nakshatras[nakData.index] || `Nakṣatra ${nakData.index}`,
      start: sunriseTime.date.toISOString(),
      end: nakData.endTime?.date.toISOString(),
      description: nakData.description,
    },
    yoga: {
      index: yogaData.index,
      value: yogas[yogaData.index] || `Yoga ${yogaData.index}`,
      start: sunriseTime.date.toISOString(),
      end: yogaData.endTime?.date.toISOString(),
      description: yogaData.description,
    },
    karana: {
      index: karanaData.index,
      value: karanas[karanaData.index] || `Karaṇa ${karanaData.index}`,
      start: sunriseTime.date.toISOString(),
      end: sunsetTime.date.toISOString(),
      description: karanaData.description,
    },
    vaara: {
      index: vaaraData.index,
      value: vaaras[vaaraData.index] || `Vaara ${vaaraData.index}`,
      start: sunriseTime.date.toISOString(),
      end: sunsetTime.date.toISOString(),
      description: vaaraData.description,
    },
    masa: {
      index: masaData.masa,
      value:
        (masaData.isLeap ? "Adhika " : "") +
        (masas[masaData.masa] || `Māsa ${masaData.masa}`),
      description:
        "Māsa signifies the lunar month as determined by the interval between new moons. A leap month (Adhika Māsa) occurs when the Sun remains in the same zodiac sign across successive new moons.",
    },
    ritu: {
      index: rituNum,
      value: ritus[rituNum] || `Ṛtu ${rituNum}`,
      description:
        "Ṛtu (season) divides the year into six segments, reflecting nature's cyclic changes celebrated in numerous Hindu festivals.",
    },
    ahargana: {
      index: Math.floor(aharganaNum),
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
      index: samvatNum,
      value: samvats[samvatNum] || `Samvatsara ${samvatNum}`,
      description:
        "Samvatsara is the name of the year in the 60-year cycle, each bearing its own mythological and astrological significance.",
    },
    sunrise: {
      value: sunriseTime.date.toISOString(),
      description:
        "Sunrise is revered as a sacred time that marks the beginning of the day and the renewal of spiritual energy.",
    },
    sunset: {
      value: sunsetTime.date.toISOString(),
      description:
        "Sunset signals the end of the day and is a time for reflection, prayer, and letting go in the Hindu tradition.",
    },
    day_duration: {
      duration: dayDuration.duration,
      value: dayDuration.formatted,
      description:
        "Day Duration is the total span of daylight, important for scheduling rituals and daily observances in accordance with natural cycles.",
    },
  };
}

export { PanchangaInput, PanchangaResponse };
