const MINIMUM_DAYS = 1;

export function smartRoundDays(days: number) {
  if (!Number.isFinite(days) || days <= MINIMUM_DAYS) {
    return MINIMUM_DAYS;
  }

  if (days <= 3) {
    return Math.ceil(days * 2) / 2;
  }

  return Math.ceil(days);
}

export function displayDays(days: number) {
  const rounded = smartRoundDays(days);

  return Number.isInteger(rounded) ? rounded : Number(rounded.toFixed(1));
}
