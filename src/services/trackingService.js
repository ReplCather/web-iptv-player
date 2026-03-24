import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

/**
 * Get device fingerprint using canvas and WebGL
 */
export function generateDeviceFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('Browser Fingerprint', 2, 15);
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.fillText('Browser Fingerprint', 4, 17);
  
  const canvasFingerprint = canvas.toDataURL();
  
  // WebGL fingerprint
  const gl = canvas.getContext('webgl');
  const debugInfo = gl ? gl.getExtension('WEBGL_debug_renderer_info') : null;
  const webglFingerprint = gl && debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
  
  // Combine fingerprints
  const combined = `${canvasFingerprint}-${webglFingerprint}-${navigator.userAgent}`;
  return {
    deviceFingerprint: btoa(combined).substring(0, 255),
    canvasFingerprint: btoa(canvasFingerprint).substring(0, 255),
    webglFingerprint: String(webglFingerprint).substring(0, 255)
  };
}

/**
 * Parse user agent to get device and browser info
 */
export function parseUserAgent(userAgent) {
  const ua = userAgent.toLowerCase();
  
  // OS Detection
  let osName = 'Unknown';
  let osVersion = 'Unknown';
  
  if (ua.includes('windows')) {
    osName = 'Windows';
    if (ua.includes('windows nt 10.0')) osVersion = '10/11';
    else if (ua.includes('windows nt 6.3')) osVersion = '8.1';
    else if (ua.includes('windows nt 6.2')) osVersion = '8';
  } else if (ua.includes('macintosh')) {
    osName = 'macOS';
    const match = ua.match(/os x ([\d_]+)/);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (ua.includes('linux')) {
    osName = 'Linux';
  } else if (ua.includes('iphone')) {
    osName = 'iOS';
  } else if (ua.includes('android')) {
    osName = 'Android';
  }
  
  // Browser Detection
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (ua.includes('edg/')) {
    browserName = 'Edge';
    const match = ua.match(/edg\/([\d.]+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('chrome')) {
    browserName = 'Chrome';
    const match = ua.match(/chrome\/([\d.]+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('safari')) {
    browserName = 'Safari';
    const match = ua.match(/version\/([\d.]+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('firefox')) {
    browserName = 'Firefox';
    const match = ua.match(/firefox\/([\d.]+)/);
    if (match) browserVersion = match[1];
  }
  
  return {
    osName,
    osVersion,
    browserName,
    browserVersion,
    userAgent
  };
}

/**
 * Get user location and IP from IP geolocation API
 */
export async function getLocationData() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch location data');
    
    const data = await response.json();
    
    return {
      ipAddress: data.ip,
      country: data.country_name,
      countryCode: data.country_code,
      region: data.region,
      city: data.city,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      timezone: data.timezone,
      isp: data.org
    };
  } catch (error) {
    console.error('[v0] Error fetching location data:', error);
    return {
      ipAddress: 'unknown',
      country: 'unknown',
      countryCode: 'unknown',
      region: 'unknown',
      city: 'unknown',
      latitude: 0,
      longitude: 0,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isp: 'unknown'
    };
  }
}

/**
 * Get screen and device info
 */
export function getScreenInfo() {
  return {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    screenColorDepth: window.screen.colorDepth,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    language: navigator.language,
    acceptLanguage: navigator.languages.join(','),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}

/**
 * Collect all user data
 */
export async function collectUserData() {
  const locationData = await getLocationData();
  const fingerprints = generateDeviceFingerprint();
  const userAgentData = parseUserAgent(navigator.userAgent);
  const screenInfo = getScreenInfo();
  const referrer = document.referrer || 'Direct';
  
  return {
    ...locationData,
    ...fingerprints,
    ...userAgentData,
    ...screenInfo,
    referrer
  };
}

/**
 * Track user session
 */
export async function trackSession(userData = null) {
  if (!supabase) {
    console.warn('[v0] Supabase not configured');
    return null;
  }
  
  try {
    if (!userData) {
      userData = await collectUserData();
    }
    
    const sessionData = {
      ip_address: userData.ipAddress,
      country_code: userData.countryCode,
      country_name: userData.country,
      city: userData.city,
      region_name: userData.region,
      latitude: userData.latitude,
      longitude: userData.longitude,
      timezone: userData.timezone,
      isp: userData.isp,
      device_fingerprint: userData.deviceFingerprint,
      canvas_fingerprint: userData.canvasFingerprint,
      webgl_fingerprint: userData.webglFingerprint,
      os_name: userData.osName,
      os_version: userData.osVersion,
      browser_name: userData.browserName,
      browser_version: userData.browserVersion,
      user_agent: userData.userAgent,
      screen_width: userData.screenWidth,
      screen_height: userData.screenHeight,
      screen_color_depth: userData.screenColorDepth,
      language: userData.language,
      accept_language: userData.acceptLanguage,
      referrer: userData.referrer,
      session_start: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('user_sessions')
      .insert([sessionData])
      .select();
    
    if (error) {
      console.error('[v0] Error tracking session:', error);
      return null;
    }
    
    console.log('[v0] Session tracked:', data?.[0]?.id);
    return data?.[0];
  } catch (error) {
    console.error('[v0] Error in trackSession:', error);
    return null;
  }
}

/**
 * Track page view
 */
export async function trackPageView(sessionId, pageUrl, pageTitle, timeOnPage = 0) {
  if (!supabase || !sessionId) {
    console.warn('[v0] Supabase not configured or sessionId missing');
    return null;
  }
  
  try {
    const pageViewData = {
      session_id: sessionId,
      page_url: pageUrl,
      page_title: pageTitle,
      referrer_url: document.referrer,
      time_on_page: timeOnPage,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('user_page_views')
      .insert([pageViewData])
      .select();
    
    if (error) {
      console.error('[v0] Error tracking page view:', error);
      return null;
    }
    
    console.log('[v0] Page view tracked');
    return data?.[0];
  } catch (error) {
    console.error('[v0] Error in trackPageView:', error);
    return null;
  }
}

/**
 * Track custom event
 */
export async function trackEvent(sessionId, eventName, eventData = {}) {
  if (!supabase || !sessionId) {
    console.warn('[v0] Supabase not configured or sessionId missing');
    return null;
  }
  
  try {
    const event = {
      session_id: sessionId,
      event_name: eventName,
      event_data: eventData,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('user_events')
      .insert([event])
      .select();
    
    if (error) {
      console.error('[v0] Error tracking event:', error);
      return null;
    }
    
    console.log(`[v0] Event tracked: ${eventName}`);
    return data?.[0];
  } catch (error) {
    console.error('[v0] Error in trackEvent:', error);
    return null;
  }
}

export default {
  trackSession,
  trackPageView,
  trackEvent,
  collectUserData,
  generateDeviceFingerprint,
  parseUserAgent,
  getLocationData,
  getScreenInfo
};
