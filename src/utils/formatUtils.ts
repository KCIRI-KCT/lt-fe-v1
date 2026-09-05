// ============================================================================
// Format Utilities — Safe value formatting with '-' fallback (Removes NaN)
// ============================================================================

/**
 * Formats a value as a string safely. Returns '-' if value is null, undefined, empty, or NaN.
 */
export function safeValue(val: unknown, fallback = '-'): string {
  if (val === null || val === undefined || val === '' || val === 'NaN' || val === 'undefined' || val === 'null') {
    return fallback;
  }
  if (typeof val === 'number') {
    return isNaN(val) ? fallback : String(val);
  }
  const str = String(val).trim();
  if (str === '' || str.toLowerCase() === 'nan' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') {
    return fallback;
  }
  return str;
}

/**
 * Formats a numeric value safely. Returns '-' if value is invalid or NaN.
 */
export function safeFormatNumber(val: unknown, decimals = 1, fallback = '-'): string {
  if (val === null || val === undefined || val === '') return fallback;
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num)) return fallback;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formats a percentage value safely. Returns '-' if value is invalid or NaN.
 */
export function safeFormatPercent(val: unknown, fallback = '-'): string {
  if (val === null || val === undefined || val === '') return fallback;
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num)) return fallback;
  return `${Math.round(num * 10) / 10}%`;
}
