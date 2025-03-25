import { AstroTime, Observer, Body, SearchMoonPhase } from "astronomy-engine";
import { TithiResult } from "../models/types";
import {
  tropicalLongitude,
  mod360,
  inverseLagrange,
  addDays,
  getAngleDifference,
} from "../utils/helpers";

export function computeTithi(
  sunriseTime: AstroTime,
  observer: Observer
): TithiResult {
  // Compute the Moon–Sun phase at sunrise directly using tropical longitudes.
  const sunTrop = tropicalLongitude(Body.Sun, sunriseTime, observer);
  const moonTrop = tropicalLongitude(Body.Moon, sunriseTime, observer);
  const phase = mod360(moonTrop - sunTrop);

  // Determine the current tithi (each tithi spans 12°)
  let today = Math.ceil(phase / 12);
  if (today === 0) today = 30;
  const degreesLeft = today * 12 - phase;

  // Sample the relative motion at several offsets (in days)
  const offsets = [0.25, 0.5, 0.75, 1.0];
  const relativeMotions: number[] = [];
  for (const t of offsets) {
    const sampleTime = addDays(sunriseTime, t);
    const lunarDiff = mod360(
      tropicalLongitude(Body.Moon, sampleTime, observer) -
        tropicalLongitude(Body.Moon, sunriseTime, observer)
    );
    const solarDiff = mod360(
      tropicalLongitude(Body.Sun, sampleTime, observer) -
        tropicalLongitude(Body.Sun, sunriseTime, observer)
    );
    const relativeMotion = getAngleDifference(lunarDiff, solarDiff);
    relativeMotions.push(relativeMotion);
  }

  // Use inverse Lagrange interpolation with unwrapped values.
  const approxEnd = inverseLagrange(offsets, relativeMotions, degreesLeft);

  const tithiEndTime = addDays(sunriseTime, approxEnd);

  const result: TithiResult = {
    index: today,
    endTime: tithiEndTime,
    description:
      "Tithi is the lunar day defined by each 12° increment in the Moon–Sun separation. It is essential for determining auspicious times for ceremonies and rituals.",
  };

  // Check for a skipped tithi by computing the phase one day later.
  const tomorrowTime = addDays(sunriseTime, 1);
  const sunTropTomorrow = tropicalLongitude(Body.Sun, tomorrowTime, observer);
  const moonTropTomorrow = tropicalLongitude(Body.Moon, tomorrowTime, observer);
  const phaseTomorrow = mod360(moonTropTomorrow - sunTropTomorrow);
  const tomorrow = Math.ceil(phaseTomorrow / 12);
  if ((tomorrow - today + 30) % 30 > 1) {
    // There is a skipped tithi.
    const leapTithi = today + 1;
    const degreesLeftLeap = leapTithi * 12 - phase;
    const approxEndLeap = inverseLagrange(
      offsets,
      relativeMotions,
      degreesLeftLeap
    );
    const tithiEndLeapTime = addDays(sunriseTime, approxEndLeap);
    result.leapTithi = {
      index: leapTithi,
      endTime: tithiEndLeapTime,
    };
  }
  return result;
}
