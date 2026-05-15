<template>
  <div class="app-container">
    <Nav :tvs="tvs" :active="url" :mode="currentMode" :loading="loading" :currentCountry="selectedCountry" @switchMode="switchMode" @openSettings="showSettings = true" />
    <Settings :isOpen="showSettings" @close="showSettings = false" @countryChanged="onCountryChanged" />
    
    <!-- Error notification -->
    <Transition name="slide">
      <div v-if="errorNotification" class="error-notification">
        <span>{{ errorNotification }}</span>
        <button @click="errorNotification = ''" class="close-btn">&times;</button>
      </div>
    </Transition>
    
    <component :is="currentView" :value="url" :track="caption" />
  </div>
</template>

<script setup>
import { listTv } from "./api";
import { parse, suffix } from "./utils/tvlistsupport";
import { sanitizeUrl, sanitizeString, safeLocalStorage, getLocalStorage, error as logError } from "./utils/securityUtils";
import { ref, computed, onMounted, watch } from "vue";
import Home from "./views/Index.vue";
import NotFound from "./views/NotFound.vue";
import Nav from "./components/Nav.vue";
import Settings from "./components/Settings.vue";
import { useI18n } from "./i18n/index.js";
import { getSelectedCountry, getPlaylistUrl } from "./services/geolocationService.js";

const { t, locale } = useI18n();

const IPTV_URL = "https://iptv-org.github.io/iptv/index.m3u";
const RADIO_GLOBAL_URL = "https://iptv-org.github.io/iptv/index.m3u";
const LOAD_TIMEOUT = 15000;

const routes = { "/": Home };
const currentPath = ref(window.location.hash);
const url = ref("");
const tvs = ref([]);
const caption = ref("");
const currentMode = ref("home");
const loading = ref(false);
const showSettings = ref(false);
const selectedCountry = ref(getSelectedCountry());
const errorNotification = ref("");

// Cache for loaded playlists
const playlistCache = {};

// Show error notification
function showError(message) {
  errorNotification.value = message;
  setTimeout(() => {
    if (errorNotification.value === message) {
      errorNotification.value = "";
    }
  }, 5000);
}

window.addEventListener("hashchange", () => {
  currentPath.value = window.location.hash;
});

const currentView = computed(() => {
  const hash = currentPath.value;
  if (hash.slice(1).includes("?")) {
    const searchParams = new URLSearchParams(hash.slice(hash.indexOf("?")));
    const newUrl = searchParams.get("url");
    const newCaption = searchParams.get("caption");
    const mode = searchParams.get("mode");

    if (newUrl) {
      const safeUrl = sanitizeUrl(decodeURIComponent(newUrl));
      if (safeUrl) {
        url.value = safeUrl;
      } else {
        logError("Invalid URL blocked:", newUrl);
      }
    }
    
    if (newCaption) caption.value = sanitizeString(decodeURIComponent(newCaption));

    if (mode) {
      const previousMode = currentMode.value;
      currentMode.value = mode;

      if (previousMode !== mode && !newUrl) {
        loadPlaylistForMode(mode, true);
      }
    }
  }
  return routes[hash.slice(1).split("?")[0] || "/"] || NotFound;
});

function switchMode(mode) {
  currentMode.value = mode;
  loadPlaylistForMode(mode, true);
}

function loadPlaylistForMode(mode, preserveSelection = false) {
  let playlistUrl;

  if (mode === "iptv") {
    playlistUrl = IPTV_URL;
  } else if (mode === "radio") {
    playlistUrl = RADIO_GLOBAL_URL;
  } else {
    playlistUrl = getPlaylistUrl(selectedCountry.value, "home");
  }

  loadPlaylist(playlistUrl, mode, preserveSelection);
}

function onCountryChanged(country) {
  selectedCountry.value = country;
}

async function loadPlaylist(playlistUrl, mode = "home", preserveSelection = false) {
  if (!playlistUrl) {
    const params = new URLSearchParams(window.location.hash.replace("#/", ""));
    playlistUrl = params.get("s");

    if (!playlistUrl) {
      if (mode === "iptv") {
        playlistUrl = IPTV_URL;
      } else if (mode === "radio") {
        playlistUrl = RADIO_GLOBAL_URL;
      } else {
        playlistUrl = getPlaylistUrl(selectedCountry.value, "home");
      }
    }
  }

  // Check cache first
  if (playlistCache[playlistUrl]) {
    let cached = playlistCache[playlistUrl];

    if (mode === "radio") {
      cached = filterRadios(cached);
    }

    tvs.value = cached;
    if (!preserveSelection) {
      selectFirstChannel();
    }
    return;
  }

  loading.value = true;
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LOAD_TIMEOUT);
  
  try {
    let suffixName = suffix(playlistUrl);
    if (suffixName === "m3u8") suffixName = "m3u";

    const d = await listTv(playlistUrl);
    clearTimeout(timeoutId);
    
    if (!d || !d.data) {
      throw new Error("Empty response");
    }
    
    let parsed = parse(d.data, suffixName);
    
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Invalid playlist format");
    }

    if (mode === "radio") {
      parsed = filterRadios(parsed);
    }

    playlistCache[playlistUrl] = parsed;
    tvs.value = parsed;

    if (mode === "home") {
      safeLocalStorage("tvlistUrl", playlistUrl);
    }

    if (!preserveSelection) {
      selectFirstChannel();
    }
  } catch (e) {
    clearTimeout(timeoutId);
    logError("Failed to load playlist:", e);
    
    let errorMsg;
    if (e.name === "AbortError" || e.message?.includes("timeout")) {
      errorMsg = locale.value === "fr" ? "Délai d'attente dépassé" : "Request timeout";
    } else if (e.message?.includes("Network") || e.code === "ERR_NETWORK") {
      errorMsg = locale.value === "fr" ? "Erreur réseau" : "Network error";
    } else if (e.message?.includes("Invalid playlist")) {
      errorMsg = locale.value === "fr" ? "Format de playlist invalide" : "Invalid playlist format";
    } else {
      errorMsg = locale.value === "fr" ? "Impossible de charger la playlist" : "Failed to load playlist";
    }
    
    showError(errorMsg);
    tvs.value = [{ name: t("failedToLoad"), isTv: false }];
  } finally {
    loading.value = false;
  }
}

function filterRadios(channels) {
  return channels.filter((channel) => {
    if (!channel.isTv) return true;

    const name = (channel.name || "").toLowerCase();
    const groupTitle = (channel.meta?.["group-title"] || "").toLowerCase();

    const isRadio =
      name.includes("radio") ||
      name.includes("fm") ||
      groupTitle.includes("radio") ||
      groupTitle.includes("audio");

    return isRadio;
  });
}

function selectFirstChannel() {
  if (!url.value || currentMode.value === "iptv") {
    const firstTv = tvs.value.find((t) => t.isTv);
    if (firstTv) {
      url.value = firstTv.url;
      caption.value = firstTv.caption;
    }
  }
}

// Watch for country changes and reload playlist in HOME mode
watch(
  () => selectedCountry.value,
  () => {
    if (currentMode.value === "home") {
      loadPlaylistForMode("home");
    }
  }
);

onMounted(() => {
  const params = new URLSearchParams(window.location.hash.replace("#/", ""));
  const url0 = params.get("url");
  const mode = params.get("mode") || "home";

  if (url0) {
    const safeUrl = sanitizeUrl(decodeURIComponent(url0));
    if (safeUrl) {
      url.value = safeUrl;
    }
  }
  caption.value = params.get("caption");
  currentMode.value = mode;

  loadPlaylistForMode(mode);
});
</script>

<style>
.app-container {
  position: relative;
  min-height: 100vh;
}

.error-notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: #dc2626;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-width: 400px;
}

.error-notification .close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.8;
}

.error-notification .close-btn:hover {
  opacity: 1;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
