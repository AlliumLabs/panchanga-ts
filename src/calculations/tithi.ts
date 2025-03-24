import { AstroTime, Observer, Body, SearchMoonPhase } from "astronomy-engine";
import { TithiResult } from "../models/types";
import { tropicalLongitude, mod360 } from "../utils/helpers";

export function computeTithi(
  sunriseTime: AstroTime,
  observer: Observer
): TithiResult {
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
