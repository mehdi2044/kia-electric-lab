export const toman = new Intl.NumberFormat('fa-IR');

export function formatToman(value: number): string {
  return `${toman.format(Math.round(value))} تومان`;
}

export function formatNumber(value: number, digits = 1): string {
  return value.toLocaleString('fa-IR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: value % 1 === 0 ? 0 : digits
  });
}
