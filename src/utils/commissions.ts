export function getCommissionRate(value: number) {
  if (value <= 100000) return 0.08;
  if (value <= 300000) return 0.06;
  return 0.04;
}

export function getCommissionLabel(value: number) {
  return `${Math.round(getCommissionRate(value) * 100)}%`;
}

export function getCommissionValue(value: number) {
  return Math.round(value * getCommissionRate(value));
}
