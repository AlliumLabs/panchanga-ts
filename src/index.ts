// panchanga.ts

import {
  AstroTime,
  Observer,
  SearchRiseSet,
  SearchMoonPhase,
  Equator,
  Ecliptic,
  Body,
  Vector,
} from "astronomy-engine";
import sanskritNames from "./data/sanskrit_names";
import cities from "./data/cities";

const tithis = sanskritNames.tithis;
const nakshatras = sanskritNames.nakshatras;
const vaaras = sanskritNames.varas;
const yogas = sanskritNames.yogas;
const karanas = sanskritNames.karanas;
const masas = sanskritNames.masas;
const samvats = sanskritNames.samvats;
const ritus = sanskritNames.ritus;

export interface Place {
  latitude: number;
  longitude: number;
  timezone: string; // can be a timezone string or numeric offset in hours
}

export interface PanchangaResponse {
  tithi: {
    value: string;
    start?: string;
    end?: string;
    description: string;
  };
  nakshatra: {
    value: string;
    start?: string;
    end?: string;
    description: string;
  };
  yoga: {
    value: string;
    start?: string;
    end?: string;
    description: string;
  };
  karana: {
    value: string;
    start?: string;
    end?: string;
    description: string;
  };
  vaara: {
    value: string;
    start?: string;
    end?: string;
    description: string;
  };
  masa: {
    value: string;
    description: string;
  };
  ritu: {
    value: string;
    description: string;
  };
  ahargana: {
    value: string;
    description: string;
  };
  elapsed_year: {
    kali: number;
    saka: number;
    description: string;
  };
  samvatsara: {
    value: string;
    description: string;
  };
  sunrise: {
    value: string;
    description: string;
  };
  sunset: {
    value: string;
    description: string;
  };
  day_duration: {
    value: string;
    description: string;
  };
}

export interface PanchangaInput {
  date: string; // ISO or DD/MM/YYYY
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone: string | number;
}

// --- Helper Functions ---

function getJulianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function mod360(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function formatTimeFromDate(date: Date): string {
  const hh = date.getHours().toString().padStart(2, "0");
  const mm = date.getMinutes().toString().padStart(2, "0");
  const ss = date.getSeconds().toString().padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function adjustTimeByTimezone(date: Date, timezone: string | number): Date {
  if (typeof timezone === "string" && isNaN(Number(timezone))) {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "short",
      });
      return new Date(formatter.format(date));
    } catch (e) {
      console.warn(
        `Invalid timezone string: ${timezone}. Using numeric offset.`
      );
      return new Date(date.getTime() + Number(timezone) * 3600000);
    }
  } else {
    return new Date(date.getTime() + Number(timezone) * 3600000);
  }
}

function astroTimeToISOString(
  time: AstroTime,
  timezone: string | number
): string {
  const localDate = adjustTimeByTimezone(time.date, timezone);
  return localDate.toISOString();
}

function astroTimeToLocalTimeString(
  time: AstroTime,
  timezone: string | number
): string {
  const localDate = adjustTimeByTimezone(time.date, timezone);
  return formatTimeFromDate(localDate);
}

function addDays(time: AstroTime, days: number): AstroTime {
  const d = new Date(time.date.getTime());
  d.setUTCSeconds(d.getUTCSeconds() + days * 86400);
  return new AstroTime(d);
}

function inverseLagrange(x: number[], y: number[], target: number): number {
  let total = 0;
  for (let i = 0; i < x.length; i++) {
    let numer = 1;
    let denom = 1;
    for (let j = 0; j < x.length; j++) {
      if (j !== i) {
        numer *= target - y[j];
        denom *= y[i] - y[j];
      }
    }
    total += (numer * x[i]) / denom;
  }
  return total;
}

async function interpolateTime(
  startTime: AstroTime,
  observer: Observer,
  target: number,
  f: (t: AstroTime) => number,
  offsets: number[] = [0, 0.25, 0.5, 0.75, 1.0]
): Promise<AstroTime> {
  const samples: number[] = [];
  for (const offset of offsets) {
    const sampleTime = addDays(startTime, offset);
    let value = f(sampleTime);
    value = mod360(value);
    samples.push(value);
  }
  const frac = inverseLagrange(offsets, samples, target);
  return addDays(startTime, frac);
}

// Get tropical ecliptic longitude of a body.
function tropicalLongitude(
  body: Body,
  time: AstroTime,
  observer: Observer
): number {
  const eq = Equator(body, time, observer, true, false);
  // Convert equatorial coordinates (ra, dec in degrees) to a unit vector.
  const raRad = (eq.ra * Math.PI) / 180;
  const decRad = (eq.dec * Math.PI) / 180;
  const vector = new Vector(
    Math.cos(decRad) * Math.cos(raRad),
    Math.cos(decRad) * Math.sin(raRad),
    Math.sin(decRad),
    time
  );
  // Pass the vector to Ecliptic.
  const ec = Ecliptic(vector);
  return mod360(ec.elon);
}

// Approximate Lahiri Ayanamsa.
function computeAyanamsa(time: AstroTime): number {
  const year = time.date.getUTCFullYear();
  return 24.07 + 0.014 * (year - 2000);
}

// Compute sidereal longitude: tropical minus ayanamsa.
function siderealLongitude(
  body: Body,
  time: AstroTime,
  observer: Observer
): number {
  const trop = tropicalLongitude(body, time, observer);
  const ayan = computeAyanamsa(time);
  return mod360(trop - ayan);
}

// --- Panchanga Computation Functions ---

function computeTithi(
  sunriseTime: AstroTime,
  observer: Observer
): { index: number; endTime: AstroTime | null; description: string } {
  const sunTrop = tropicalLongitude(Body.Sun, sunriseTime, observer);
  const moonTrop = tropicalLongitude(Body.Moon, sunriseTime, observer);
  const phase = mod360(moonTrop - sunTrop);
  let tithiIndex = Math.ceil(phase / 12);
  if (tithiIndex === 0) tithiIndex = 30;
  const targetPhase = tithiIndex * 12;
  const tithiEndTime = SearchMoonPhase(targetPhase, sunriseTime, 2);
  return {
    index: tithiIndex,
    endTime: tithiEndTime,
    description:
      "Tithi is the lunar day marked by every 12° increase in the Moon–Sun separation. It determines auspicious moments for festivals, rituals, and daily worship.",
  };
}

async function computeNakshatra(
  sunriseTime: AstroTime,
  observer: Observer
): Promise<{ index: number; endTime: AstroTime | null; description: string }> {
  const moonSid = siderealLongitude(Body.Moon, sunriseTime, observer);
  let nakIndex = Math.ceil((moonSid * 27) / 360);
  if (nakIndex === 0) nakIndex = 27;
  const targetAngle = nakIndex * (360 / 27);
  const endTime = await interpolateTime(
    sunriseTime,
    observer,
    targetAngle,
    (t) => siderealLongitude(Body.Moon, t, observer)
  );
  return {
    index: nakIndex,
    endTime: endTime,
    description:
      "Nakṣatra divides the ecliptic into 27 lunar mansions, each associated with unique divine qualities and influences on destiny according to Vedic astrology.",
  };
}

async function computeYoga(
  sunriseTime: AstroTime,
  observer: Observer
): Promise<{ index: number; endTime: AstroTime | null; description: string }> {
  const sunSid = siderealLongitude(Body.Sun, sunriseTime, observer);
  const moonSid = siderealLongitude(Body.Moon, sunriseTime, observer);
  const total = mod360(sunSid + moonSid);
  let yogaIndex = Math.ceil((total * 27) / 360);
  if (yogaIndex === 0) yogaIndex = 27;
  const targetTotal = yogaIndex * (360 / 27);
  const endTime = await interpolateTime(
    sunriseTime,
    observer,
    targetTotal,
    (t) => {
      const sunS = siderealLongitude(Body.Sun, t, observer);
      const moonS = siderealLongitude(Body.Moon, t, observer);
      return mod360(sunS + moonS);
    }
  );
  return {
    index: yogaIndex,
    endTime: endTime,
    description:
      "Yoga is calculated from the sum of the Sun’s and Moon’s sidereal longitudes. It reflects the overall cosmic energy and influences the auspiciousness of the day.",
  };
}

function computeKarana(
  sunriseTime: AstroTime,
  observer: Observer
): { index: number; description: string } {
  const sunTrop = tropicalLongitude(Body.Sun, sunriseTime, observer);
  const moonTrop = tropicalLongitude(Body.Moon, sunriseTime, observer);
  const phase = mod360(moonTrop - sunTrop);
  let karanaIndex = Math.ceil(phase / 6);
  if (karanaIndex === 0) karanaIndex = 60;
  return {
    index: karanaIndex,
    description:
      "Karaṇa, being half of a Tithi (6° of separation), further refines the day's time segments for precise ritual observances.",
  };
}

function computeVaara(
  sunriseTime: AstroTime,
  timezone: string | number
): { index: number; time: string; description: string } {
  const localDate = adjustTimeByTimezone(sunriseTime.date, timezone);
  const weekdayIndex = localDate.getUTCDay();
  return {
    index: weekdayIndex,
    time: formatTimeFromDate(localDate),
    description:
      "Vāra represents the weekday, each imbued with its own divine character and spiritual significance.",
  };
}

function computeMasa(
  sunriseTime: AstroTime,
  observer: Observer
): { masa: number; isLeap: boolean } {
  const nextNewMoon = SearchMoonPhase(0, sunriseTime, 2);
  const estimatedPrev = addDays(sunriseTime, -29.53);
  const lastNewMoon = SearchMoonPhase(0, estimatedPrev, -2);
  if (!lastNewMoon || !nextNewMoon) {
    throw new Error("Failed to compute new moon times.");
  }
  const sunTropLast = tropicalLongitude(Body.Sun, lastNewMoon, observer);
  let raasi = Math.ceil(sunTropLast / 30);
  if (raasi === 0) raasi = 12;
  let masa = raasi + 1;
  if (masa > 12) masa = masa % 12;
  const sunTropNext = tropicalLongitude(Body.Sun, nextNewMoon, observer);
  const nextRaasi = Math.ceil(sunTropNext / 30) || 12;
  const isLeap = raasi === nextRaasi;
  return { masa, isLeap };
}

function computeRitu(masa: number): number {
  return Math.floor((masa - 1) / 2);
}

function computeAhargana(julianDay: number): number {
  return julianDay - 588465.5;
}

function computeElapsedYear(
  julianDay: number,
  masa: number
): { kali: number; saka: number } {
  const siderealYear = 365.25636;
  const ahar = computeAhargana(julianDay);
  const kali = Math.floor((ahar + (4 - masa) * 30) / siderealYear);
  const saka = kali - 3179;
  return { kali, saka };
}

function computeSamvatsara(julianDay: number, masa: number): number {
  let { kali } = computeElapsedYear(julianDay, masa);
  if (kali >= 4009) {
    kali = (kali - 14) % 60;
  }
  const samvat = (kali + 27 + Math.floor((kali * 211 - 108) / 18000)) % 60;
  return samvat;
}

function computeDayDuration(
  sunriseTime: AstroTime,
  sunsetTime: AstroTime
): { duration: number; formatted: string } {
  const dtRise = sunriseTime.date.getTime();
  const dtSet = sunsetTime.date.getTime();
  const diffHours = (dtSet - dtRise) / 3600000;
  const totalSec = Math.round(diffHours * 3600);
  const hh = Math.floor(totalSec / 3600)
    .toString()
    .padStart(2, "0");
  const mm = Math.floor((totalSec % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const ss = (totalSec % 60).toString().padStart(2, "0");
  return { duration: diffHours, formatted: `${hh}:${mm}:${ss}` };
}

// --- Main Function ---
// This is the simple function call that wraps the Panchānga calculations.
export async function calculatePanchanga(input: {
  date: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
}): Promise<PanchangaResponse> {
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

  // Parse date (ISO or DD/MM/YYYY)
  let inputDate = new Date(input.date);
  if (isNaN(inputDate.getTime())) {
    const parts = input.date.split("/");
    if (parts.length === 3) {
      const [d, m, y] = parts.map(Number);
      inputDate = new Date(Date.UTC(y, m - 1, d));
    } else {
      throw new Error("Invalid date format.");
    }
  }

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

  // Compute sunrise and sunset times.
  const sunriseTime = SearchRiseSet(Body.Sun, observer, +1, utTime, 2);
  const sunsetTime = SearchRiseSet(Body.Sun, observer, -1, utTime, 2);
  if (!sunriseTime || !sunsetTime) {
    throw new Error("Failed to compute sunrise and sunset times.");
  }

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
      description:
        "Tithi is the lunar day defined by a 12° increment in the Moon–Sun separation. It determines auspicious moments for festivals, rituals, and daily worship.",
    },
    nakshatra: {
      value: nakshatras[nakData.index] || `Nakṣatra ${nakData.index}`,
      start: astroTimeToISOString(sunriseTime, place.timezone),
      end: nakData.endTime
        ? astroTimeToISOString(nakData.endTime, place.timezone)
        : undefined,
      description:
        "Nakṣatra divides the ecliptic into 27 lunar mansions. Each nakṣatra is associated with a divine energy and plays a pivotal role in Vedic astrology and personal destiny.",
    },
    yoga: {
      value: yogas[yogaData.index] || `Yoga ${yogaData.index}`,
      start: astroTimeToISOString(sunriseTime, place.timezone),
      end: yogaData.endTime
        ? astroTimeToISOString(yogaData.endTime, place.timezone)
        : undefined,
      description:
        "Yoga is derived from the sum of the Sun’s and Moon’s sidereal longitudes. It reflects the combined cosmic energy and influences the overall auspiciousness of the day.",
    },
    karana: {
      value: karanas[karanaData.index] || `Karaṇa ${karanaData.index}`,
      start: astroTimeToISOString(sunriseTime, place.timezone),
      end: astroTimeToISOString(sunriseTime, place.timezone),
      description:
        "Karaṇa, being half of a Tithi (6° of separation), further refines the daily time segments for precise ritual observances.",
    },
    vaara: {
      value: vaaras[vaaraData.index] || `Vaara ${vaaraData.index}`,
      start: astroTimeToISOString(sunriseTime, place.timezone),
      end: astroTimeToISOString(sunriseTime, place.timezone),
      description:
        "Vaara denotes the weekday, each of which is dedicated to specific deities and holds unique spiritual significance.",
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
