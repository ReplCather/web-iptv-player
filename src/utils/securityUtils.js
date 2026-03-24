const DEV = import.meta.env.DEV;

export function sanitizeUrl(input) {
  if (!input) return null;
  try {
    const parsed = new URL(input);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function sanitizeString(input) {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function log(...args) {
  if (DEV) console.log(...args);
}

export function error(...args) {
  if (DEV) console.error(...args);
}
