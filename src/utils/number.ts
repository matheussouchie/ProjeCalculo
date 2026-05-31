export function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

export function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
}

export function roundToFourDecimals(value: number) {
  return Math.round(value * 10000) / 10000;
}

export function roundDays(value: number, minimum = 2) {
  return Math.max(minimum, Math.ceil(value));
}
