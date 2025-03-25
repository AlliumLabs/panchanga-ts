import { AstroTime, Observer, Body } from "astronomy-engine";

import { tropicalLongitude, mod360 } from "../utils/helpers";
import { KaranaResult } from "../models";

export function computeKarana(
  sunriseTime: AstroTime,
  observer: Observer
): KaranaResult {
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
