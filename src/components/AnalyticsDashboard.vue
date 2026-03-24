<template>
  <div v-if="isVisible" class="analytics-overlay">
    <div class="analytics-modal">
      <div class="analytics-header">
        <h1 class="analytics-title">User Analytics Dashboard</h1>
        <button class="analytics-close" @click="closeAnalytics">✕</button>
      </div>

      <div class="analytics-content">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner"></div>
          <p>Loading analytics data...</p>
        </div>

        <div v-else class="analytics-grid">
          <!-- Summary Stats -->
          <div class="stats-section">
            <h2>Summary</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">Total Sessions</div>
                <div class="stat-value">{{ totalSessions }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Total Page Views</div>
                <div class="stat-value">{{ totalPageViews }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Total Events</div>
                <div class="stat-value">{{ totalEvents }}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Unique Countries</div>
                <div class="stat-value">{{ uniqueCountries }}</div>
              </div>
            </div>
          </div>

          <!-- Top Locations -->
          <div class="locations-section">
            <h2>Top Locations</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>City</th>
                  <th>Sessions</th>
                  <th>Coordinates</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="location in topLocations" :key="`${location.country}-${location.city}`">
                  <td>{{ location.country }}</td>
                  <td>{{ location.city }}</td>
                  <td>{{ location.count }}</td>
                  <td>
                    <a 
                      :href="`https://www.google.com/maps?q=${location.latitude},${location.longitude}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="map-link"
                    >
                      📍 View
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Top Browsers -->
          <div class="browsers-section">
            <h2>Top Browsers</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Browser</th>
                  <th>OS</th>
                  <th>Sessions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="browser in topBrowsers" :key="`${browser.browserName}-${browser.osName}`">
                  <td>{{ browser.browserName }} {{ browser.browserVersion }}</td>
                  <td>{{ browser.osName }} {{ browser.osVersion }}</td>
                  <td>{{ browser.count }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Top ISPs -->
          <div class="isps-section">
            <h2>Top ISPs</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>ISP</th>
                  <th>Sessions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="isp in topIsps" :key="isp.isp">
                  <td>{{ isp.isp || 'Unknown' }}</td>
                  <td>{{ isp.count }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Recent Sessions -->
          <div class="sessions-section">
            <h2>Recent Sessions</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Location</th>
                  <th>Browser</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="session in recentSessions" :key="session.id">
                  <td>{{ session.ip_address }}</td>
                  <td>{{ session.city }}, {{ session.country_code }}</td>
                  <td>{{ session.browser_name }} on {{ session.os_name }}</td>
                  <td>{{ formatDate(session.session_start) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { createClient } from '@supabase/supabase-js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

const loading = ref(false);
const sessions = ref([]);
const pageViews = ref([]);
const events = ref([]);

const isVisible = computed(() => props.isOpen);

const totalSessions = computed(() => sessions.value.length);
const totalPageViews = computed(() => pageViews.value.length);
const totalEvents = computed(() => events.value.length);

const uniqueCountries = computed(() => {
  const countries = new Set(sessions.value.map(s => s.country_code));
  return countries.size;
});

const topLocations = computed(() => {
  const locationMap = {};
  
  sessions.value.forEach(session => {
    const key = `${session.country_name}-${session.city}`;
    if (!locationMap[key]) {
      locationMap[key] = {
        country: session.country_name || 'Unknown',
        city: session.city || 'Unknown',
        latitude: session.latitude,
        longitude: session.longitude,
        count: 0
      };
    }
    locationMap[key].count++;
  });
  
  return Object.values(locationMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
});

const topBrowsers = computed(() => {
  const browserMap = {};
  
  sessions.value.forEach(session => {
    const key = `${session.browser_name}-${session.os_name}`;
    if (!browserMap[key]) {
      browserMap[key] = {
        browserName: session.browser_name || 'Unknown',
        browserVersion: session.browser_version || '',
        osName: session.os_name || 'Unknown',
        osVersion: session.os_version || '',
        count: 0
      };
    }
    browserMap[key].count++;
  });
  
  return Object.values(browserMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
});

const topIsps = computed(() => {
  const ispMap = {};
  
  sessions.value.forEach(session => {
    const isp = session.isp || 'Unknown';
    if (!ispMap[isp]) {
      ispMap[isp] = { isp, count: 0 };
    }
    ispMap[isp].count++;
  });
  
  return Object.values(ispMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
});

const recentSessions = computed(() => {
  return [...sessions.value]
    .sort((a, b) => new Date(b.session_start) - new Date(a.session_start))
    .slice(0, 20);
});

function closeAnalytics() {
  emit('close');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

async function loadAnalytics() {
  if (!supabase) {
    console.warn('Supabase not configured');
    return;
  }

  loading.value = true;
  try {
    // Load sessions
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*')
      .order('session_start', { ascending: false });

    if (sessionsError) throw sessionsError;
    sessions.value = sessionsData || [];

    // Load page views
    const { data: pageViewsData, error: pageViewsError } = await supabase
      .from('user_page_views')
      .select('*');

    if (pageViewsError) throw pageViewsError;
    pageViews.value = pageViewsData || [];

    // Load events
    const { data: eventsData, error: eventsError } = await supabase
      .from('user_events')
      .select('*');

    if (eventsError) throw eventsError;
    events.value = eventsData || [];

    console.log('[v0] Analytics loaded:', {
      sessions: sessions.value.length,
      pageViews: pageViews.value.length,
      events: events.value.length
    });
  } catch (error) {
    console.error('[v0] Error loading analytics:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (isVisible.value) {
    loadAnalytics();
  }
});
</script>

<style scoped lang="less">
.analytics-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.analytics-modal {
  background: linear-gradient(135deg, rgba(10, 10, 20, 0.98) 0%, rgba(20, 15, 35, 0.95) 100%);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 16px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 217, 255, 0.1), 0 0 40px rgba(0, 0, 0, 0.8);
}

.analytics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.analytics-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00d9ff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.analytics-close {
  background: rgba(0, 217, 255, 0.1);
  border: 1px solid rgba(0, 217, 255, 0.2);
  color: #00d9ff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  transition: all 0.3s;
  font-weight: 300;

  &:hover {
    background: #00d9ff;
    color: #0a0a14;
    transform: scale(1.1) rotate(90deg);
  }
}

.analytics-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.6);

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid rgba(0, 217, 255, 0.2);
    border-top-color: #00d9ff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 1rem;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.analytics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.stats-section, .locations-section, .browsers-section, .isps-section, .sessions-section {
  h2 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #00d9ff;
    margin-bottom: 1rem;
    letter-spacing: 0.02em;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: rgba(0, 217, 255, 0.05);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 217, 255, 0.1);
    border-color: #00d9ff;
    box-shadow: 0 0 20px rgba(0, 217, 255, 0.2);
  }
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #00d9ff;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(0, 217, 255, 0.02);
  border: 1px solid rgba(0, 217, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;

  thead {
    background: rgba(0, 217, 255, 0.1);
  }

  th {
    padding: 1rem;
    text-align: left;
    font-weight: 700;
    color: #00d9ff;
    border-bottom: 1px solid rgba(0, 217, 255, 0.2);
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  td {
    padding: 0.8rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;

    &:last-child {
      border-bottom: none;
    }
  }

  tbody tr:hover {
    background: rgba(0, 217, 255, 0.05);
  }
}

.map-link {
  color: #00d9ff;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }
}
</style>
