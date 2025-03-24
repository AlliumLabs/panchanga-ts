import { AstroTime, Observer, Body, SearchRiseSet } from "astronomy-engine";
import { DayDurationResult, VaaraResult } from "../models/types";
import { formatTimeFromDate, adjustTimeByTimezone } from "../utils/helpers";

export function computeVaara(
  sunriseTime: AstroTime,
  timezone: string | number
): VaaraResult {
  const localDate = adjustTimeByTimezone(sunriseTime.date, timezone);
  const weekdayIndex = localDate.getUTCDay();
  return {
    index: weekdayIndex,
    time: formatTimeFromDate(localDate),
    description:
      "Vāra represents the weekday, each imbued with its own divine character and spiritual significance.",
  };
}

export function computeDayDuration(
  sunriseTime: AstroTime,
  sunsetTime: AstroTime
): DayDurationResult {
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

export function calculateSunTimes(utTime: AstroTime, observer: Observer) {
  const sunriseTime = SearchRiseSet(Body.Sun, observer, +1, utTime, 2);
  const sunsetTime = SearchRiseSet(Body.Sun, observer, -1, utTime, 2);
  
  if (!sunriseTime || !sunsetTime) {
    throw new Error("Failed to compute sunrise and sunset times.");
  }
  
  return { sunriseTime, sunsetTime };
}
