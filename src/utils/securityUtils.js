const DEV = import.meta.env.DEV;

// Whitelist des protocoles valides pour les streams IPTV
const ALLOWED_PROTOCOLS = ['http:', 'https:', 'rtmp:', 'rtsp:', 'mms:'];

// Caractères dangereux à bloquer
const DANGEROUS_PATTERNS = [
  /javascript:/gi,
  /data:/gi,
  /vbscript:/gi,
  /on\w+\s*=/gi,
  /<script/gi,
  /<\/script/gi,
];

/**
 * Valide et sanitize une URL de stream IPTV
 * @param {string} input - URL à valider
 * @returns {string|null} - URL sécurisée ou null si invalide
 */
export function sanitizeUrl(input) {
  if (!input || typeof input !== 'string') return null;
  
  const trimmed = input.trim();
  if (!trimmed) return null;
  
  // Vérifier les patterns dangereux
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      error('URL blocked due to dangerous pattern:', trimmed);
      return null;
    }
  }
  
  try {
    const parsed = new URL(trimmed);
    
    // Vérifier le protocole
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      error('URL blocked due to invalid protocol:', parsed.protocol);
      return null;
    }
    
    // Vérifier que le hostname existe
    if (!parsed.hostname || parsed.hostname.length === 0) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    // Essayer de parser comme URL relative avec protocole manquant
    if (trimmed.startsWith('//')) {
      return sanitizeUrl('https:' + trimmed);
    }
    return null;
  }
}

/**
 * Valide une URL de playlist (plus stricte - http/https uniquement)
 * @param {string} input - URL à valider
 * @returns {string|null} - URL sécurisée ou null si invalide
 */
export function sanitizePlaylistUrl(input) {
  if (!input || typeof input !== 'string') return null;
  
  const trimmed = input.trim();
  if (!trimmed) return null;
  
  // Vérifier les patterns dangereux
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return null;
    }
  }
  
  try {
    const parsed = new URL(trimmed);
    
    // Les playlists doivent être http/https uniquement
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    if (!parsed.hostname || parsed.hostname.length === 0) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize une chaîne de caractères pour éviter les injections XSS
 * @param {string} input - Chaîne à nettoyer
 * @returns {string} - Chaîne nettoyée
 */
export function sanitizeString(input) {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;')
    .trim()
    .slice(0, 500); // Limiter la longueur
}

/**
 * Valide et sanitize les données avant stockage localStorage
 * @param {string} key - Clé de stockage
 * @param {*} value - Valeur à stocker
 * @returns {boolean} - true si stockage réussi
 */
export function safeLocalStorage(key, value) {
  const allowedKeys = ['tvlistUrl', 'selectedCountry', 'locale', 'favorites'];
  
  if (!allowedKeys.includes(key)) {
    error('LocalStorage key not allowed:', key);
    return false;
  }
  
  try {
    let safeValue = value;
    
    if (key === 'tvlistUrl') {
      safeValue = sanitizePlaylistUrl(value);
      if (!safeValue) return false;
    } else if (typeof value === 'string') {
      safeValue = sanitizeString(value);
    } else if (typeof value === 'object') {
      safeValue = JSON.stringify(value);
    }
    
    localStorage.setItem(key, safeValue);
    return true;
  } catch (e) {
    error('LocalStorage error:', e);
    return false;
  }
}

/**
 * Récupère et valide une valeur du localStorage
 * @param {string} key - Clé de stockage
 * @returns {string|null} - Valeur ou null
 */
export function getLocalStorage(key) {
  try {
    const value = localStorage.getItem(key);
    
    if (key === 'tvlistUrl' && value) {
      return sanitizePlaylistUrl(value);
    }
    
    return value;
  } catch {
    return null;
  }
}

export function log(...args) {
  if (DEV) console.log('[IPTV]', ...args);
}

export function error(...args) {
  if (DEV) console.error('[IPTV]', ...args);
}
