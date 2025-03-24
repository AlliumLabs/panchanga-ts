import { AstroTime, Observer, Body } from "astronomy-engine";
import { NakshatraResult } from "../models/types";
import { siderealLongitude, interpolateTime } from "../utils/helpers";

export async function computeNakshatra(
  sunriseTime: AstroTime,
  observer: Observer
): Promise<NakshatraResult> {
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
