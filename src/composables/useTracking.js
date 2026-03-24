import { ref, onMounted, onUnmounted } from 'vue';
import { trackSession, trackPageView, trackEvent } from '@/services/trackingService';

const sessionId = ref(null);
const isTracking = ref(false);
const sessionStartTime = ref(null);

export function useTracking() {
  /**
   * Initialize tracking session
   */
  async function initializeTracking() {
    try {
      isTracking.value = true;
      sessionStartTime.value = Date.now();
      
      const session = await trackSession();
      
      if (session) {
        sessionId.value = session.id;
        console.log('[v0] Tracking initialized with session:', sessionId.value);
        
        // Store session ID in sessionStorage for persistence during user session
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('tracking_session_id', session.id);
        }
        
        return true;
      }
      
      isTracking.value = false;
      return false;
    } catch (error) {
      console.error('[v0] Error initializing tracking:', error);
      isTracking.value = false;
      return false;
    }
  }

  /**
   * Track page view
   */
  async function trackPage(pageUrl, pageTitle) {
    if (!sessionId.value) {
      console.warn('[v0] No session ID for page tracking');
      return null;
    }
    
    try {
      const pageView = await trackPageView(sessionId.value, pageUrl, pageTitle);
      return pageView;
    } catch (error) {
      console.error('[v0] Error tracking page:', error);
      return null;
    }
  }

  /**
   * Track custom event
   */
  async function logEvent(eventName, eventData = {}) {
    if (!sessionId.value) {
      console.warn('[v0] No session ID for event tracking');
      return null;
    }
    
    try {
      const event = await trackEvent(sessionId.value, eventName, eventData);
      return event;
    } catch (error) {
      console.error('[v0] Error tracking event:', error);
      return null;
    }
  }

  /**
   * Track time spent on page
   */
  function trackTimeOnPage() {
    if (!sessionStartTime.value || !sessionId.value) return;
    
    const timeSpent = Date.now() - sessionStartTime.value;
    
    return logEvent('page_engagement', {
      timeSpent,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get stored session ID
   */
  function getSessionId() {
    if (sessionId.value) return sessionId.value;
    
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('tracking_session_id');
      if (stored) {
        sessionId.value = stored;
        return stored;
      }
    }
    
    return null;
  }

  /**
   * Setup automatic page tracking
   */
  function setupRouteTracking(router) {
    if (!router) return;
    
    router.afterEach((to, from) => {
      trackPage(to.path, to.name || 'Unknown');
    });
  }

  /**
   * Track user interaction
   */
  function trackInteraction(elementName, actionType, metadata = {}) {
    return logEvent('user_interaction', {
      element: elementName,
      action: actionType,
      ...metadata,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Cleanup on unmount
   */
  function cleanup() {
    trackTimeOnPage();
    isTracking.value = false;
  }

  return {
    sessionId,
    isTracking,
    initializeTracking,
    trackPage,
    logEvent,
    trackTimeOnPage,
    getSessionId,
    setupRouteTracking,
    trackInteraction,
    cleanup
  };
}
