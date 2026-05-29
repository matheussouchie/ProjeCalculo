export function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

export function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
}

export function roundDays(value: number, minimum = 2) {
  return Math.max(minimum, Math.ceil(value));
}
