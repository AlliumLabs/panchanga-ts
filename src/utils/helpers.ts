import {
  AstroTime,
  Observer,
  Body,
  Vector,
  Equator,
  Ecliptic
} from "astronomy-engine";

export function getJulianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export function mod360(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

export function formatTimeFromDate(date: Date): string {
  const hh = date.getHours().toString().padStart(2, "0");
  const mm = date.getMinutes().toString().padStart(2, "0");
  const ss = date.getSeconds().toString().padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function adjustTimeByTimezone(date: Date, timezone: string | number): Date {
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

export function astroTimeToISOString(
  time: AstroTime,
  timezone: string | number
): string {
  const localDate = adjustTimeByTimezone(time.date, timezone);
  return localDate.toISOString();
}

export function astroTimeToLocalTimeString(
  time: AstroTime,
  timezone: string | number
): string {
  const localDate = adjustTimeByTimezone(time.date, timezone);
  return formatTimeFromDate(localDate);
}

export function addDays(time: AstroTime, days: number): AstroTime {
  const d = new Date(time.date.getTime());
  d.setUTCSeconds(d.getUTCSeconds() + days * 86400);
  return new AstroTime(d);
}

export function inverseLagrange(x: number[], y: number[], target: number): number {
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

export async function interpolateTime(
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
export function tropicalLongitude(
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
export function computeAyanamsa(time: AstroTime): number {
  const year = time.date.getUTCFullYear();
  return 24.07 + 0.014 * (year - 2000);
}

// Compute sidereal longitude: tropical minus ayanamsa.
export function siderealLongitude(
  body: Body,
  time: AstroTime,
  observer: Observer
): number {
  const trop = tropicalLongitude(body, time, observer);
  const ayan = computeAyanamsa(time);
  return mod360(trop - ayan);
}

export function parseInputDate(dateStr: string): Date {
  let inputDate = new Date(dateStr);
  if (isNaN(inputDate.getTime())) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [d, m, y] = parts.map(Number);
      inputDate = new Date(Date.UTC(y, m - 1, d));
    } else {
      throw new Error("Invalid date format.");
    }
  }
  return inputDate;
}
