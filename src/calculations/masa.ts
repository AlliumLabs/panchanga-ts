import { AstroTime, Observer, Body, SearchMoonPhase } from "astronomy-engine";
import { MasaResult } from "../models/types";
import { tropicalLongitude, addDays } from "../utils/helpers";

export function computeMasa(
  sunriseTime: AstroTime,
  observer: Observer
): MasaResult {
  const nextNewMoon = SearchMoonPhase(0, sunriseTime, 29.53);
  const lastNewMoon = addDays(sunriseTime, -29.53);
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

export function computeRitu(masa: number): number {
  return Math.floor((masa - 1) / 2);
}
