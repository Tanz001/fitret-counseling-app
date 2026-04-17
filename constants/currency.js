/**
 * Ethiopian Birr (ETB) — display helpers (amounts stored as numbers).
 */
export function formatEtb(value) {
  const n = Number(value);
  if (value === null || value === undefined || Number.isNaN(n)) {
    return 'ETB 0';
  }
  const hasFraction = Math.abs(n % 1) > 0.001;
  const formatted = n.toLocaleString('en-ET', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `ETB ${formatted}`;
}

/** e.g. +ETB 120 or -ETB 45 */
export function formatEtbSigned(value, type = 'credit') {
  const n = Math.abs(Number(value));
  if (Number.isNaN(n)) return 'ETB 0';
  const sign = type === 'credit' ? '+' : '-';
  const hasFraction = Math.abs(n % 1) > 0.001;
  const formatted = n.toLocaleString('en-ET', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${sign}ETB ${formatted}`;
}
