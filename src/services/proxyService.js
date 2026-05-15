/**
 * Service Proxy Intelligent pour IPTV
 * Gere automatiquement le fallback entre direct et proxy
 */

// Cache pour les URLs qui necessitent le proxy
const corsBlockedUrls = new Set();
const directWorkingUrls = new Set();

/**
 * Teste si une URL est accessible directement (sans CORS)
 */
async function testDirectAccess(url, timeout = 5000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Obtient l'URL du proxy pour une playlist
 */
export function getProxyPlaylistUrl(originalUrl) {
  return `/api/proxy/playlist?url=${encodeURIComponent(originalUrl)}`;
}

/**
 * Obtient l'URL du proxy pour un segment
 */
export function getProxySegmentUrl(originalUrl) {
  return `/api/proxy/segment?url=${encodeURIComponent(originalUrl)}`;
}

/**
 * Determine intelligemment si on doit utiliser le proxy
 * Mode hybride: essaie direct d'abord, fallback proxy si CORS
 */
export async function getSmartStreamUrl(originalUrl, forceProxy = false) {
  // Si force proxy ou URL deja connue comme bloquee
  if (forceProxy || corsBlockedUrls.has(originalUrl)) {
    return {
      url: getProxyPlaylistUrl(originalUrl),
      mode: 'proxy',
      reason: forceProxy ? 'forced' : 'cached-blocked',
    };
  }
  
  // Si URL deja connue comme fonctionnant en direct
  if (directWorkingUrls.has(originalUrl)) {
    return {
      url: originalUrl,
      mode: 'direct',
      reason: 'cached-working',
    };
  }
  
  // Test d'acces direct
  const canAccessDirect = await testDirectAccess(originalUrl);
  
  if (canAccessDirect) {
    directWorkingUrls.add(originalUrl);
    return {
      url: originalUrl,
      mode: 'direct',
      reason: 'tested-working',
    };
  }
  
  // CORS bloque, utiliser proxy
  corsBlockedUrls.add(originalUrl);
  return {
    url: getProxyPlaylistUrl(originalUrl),
    mode: 'proxy',
    reason: 'cors-blocked',
  };
}

/**
 * Marque une URL comme necessitant le proxy (apres echec direct)
 */
export function markAsCorsBlocked(url) {
  corsBlockedUrls.add(url);
  directWorkingUrls.delete(url);
}

/**
 * Marque une URL comme fonctionnant en direct
 */
export function markAsDirectWorking(url) {
  directWorkingUrls.add(url);
  corsBlockedUrls.delete(url);
}

/**
 * Reset le cache (utile pour debug)
 */
export function resetProxyCache() {
  corsBlockedUrls.clear();
  directWorkingUrls.clear();
}

/**
 * Obtient les stats du cache proxy
 */
export function getProxyCacheStats() {
  return {
    corsBlocked: corsBlockedUrls.size,
    directWorking: directWorkingUrls.size,
    blockedUrls: Array.from(corsBlockedUrls),
    workingUrls: Array.from(directWorkingUrls),
  };
}

export default {
  getProxyPlaylistUrl,
  getProxySegmentUrl,
  getSmartStreamUrl,
  markAsCorsBlocked,
  markAsDirectWorking,
  resetProxyCache,
  getProxyCacheStats,
};
