import { AstroTime, Observer, Body } from "astronomy-engine";
import { YogaResult } from "../models";
import { siderealLongitude, interpolateTime, mod360 } from "../utils/helpers";

export async function computeYoga(
  sunriseTime: AstroTime,
  observer: Observer
): Promise<YogaResult> {
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
      "Yoga is calculated from the sum of the Sun's and Moon's sidereal longitudes. It reflects the overall cosmic energy and influences the auspiciousness of the day.",
  };
}
