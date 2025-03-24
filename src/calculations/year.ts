export function computeAhargana(julianDay: number): number {
  return julianDay - 588465.5;
}

export function computeElapsedYear(
  julianDay: number,
  masa: number
): { kali: number; saka: number } {
  const siderealYear = 365.25636;
  const ahar = computeAhargana(julianDay);
  const kali = Math.floor((ahar + (4 - masa) * 30) / siderealYear);
  const saka = kali - 3179;
  return { kali, saka };
}

export function computeSamvatsara(julianDay: number, masa: number): number {
  let { kali } = computeElapsedYear(julianDay, masa);
  if (kali >= 4009) {
    kali = (kali - 14) % 60;
  }
  const samvat = (kali + 27 + Math.floor((kali * 211 - 108) / 18000)) % 60;
  return samvat;
}
