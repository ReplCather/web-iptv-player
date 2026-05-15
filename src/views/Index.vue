<template>
  <div class="video-container">
    <video 
      ref="videoElement"
      class="video-js vjs-default-skin vjs-big-play-centered"
      controls
      preload="auto"
      width="100%"
      height="100%"
    >
      <p class="vjs-no-js">
        To view this video please enable JavaScript, and consider upgrading to a web browser that
        <a href="https://videojs.com/html5-video-support/" target="_blank">
          supports HTML5 video
        </a>
      </p>
    </video>
    <div v-if="errorMessage" class="error-overlay">
      <div class="error-content">
        <span class="error-icon">!</span>
        <p>{{ errorMessage }}</p>
        <button v-if="canRetry" @click="retryStream" class="retry-btn">
          {{ retryText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import en from "video.js/dist/lang/en.json";
import fr from "video.js/dist/lang/fr.json";
import { computed, onMounted, ref, watch, nextTick, onBeforeUnmount } from "vue";
import { translatePlugin, refreshTranslateBtn } from "../utils/videojsPlugins";
import { useI18n } from "../i18n/index.js";
import { getSmartStreamUrl, markAsCorsBlocked } from "../services/proxyService.js";
import videojs from "video.js";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const { t, locale } = useI18n();
const props = defineProps(["value", "track"]);
const videoElement = ref(null);
const errorMessage = ref("");
const canRetry = ref(false);
const retryCount = ref(0);
const useProxy = ref(false);
const currentStreamMode = ref("direct");
let player = null;
let retryTimeout = null;
let originalUrl = null;

const retryText = computed(() => {
  return locale.value === "fr" ? "Réessayer" : "Retry";
});

const tracks = computed(() => {
  return (
    (props.track && [
      {
        src: props.track,
        srclang: "en",
        label: "default",
        mode: "showing",
      },
    ]) ||
    undefined
  );
});

function clearError() {
  errorMessage.value = "";
  canRetry.value = false;
}

function showError(message, allowRetry = true) {
  errorMessage.value = message;
  canRetry.value = allowRetry && retryCount.value < MAX_RETRIES;
}

function getErrorMessage(errorCode) {
  const messages = {
    1: locale.value === "fr" ? "Chargement interrompu" : "Loading aborted",
    2: locale.value === "fr" ? "Erreur réseau" : "Network error",
    3: locale.value === "fr" ? "Erreur de décodage" : "Decode error",
    4: locale.value === "fr" ? "Source non supportée" : "Source not supported",
    5: locale.value === "fr" ? "Source chiffrée" : "Encrypted source",
  };
  return messages[errorCode] || (locale.value === "fr" ? "Erreur de lecture" : "Playback error");
}

async function loadSource(src, forceProxy = false) {
  if (!player || !src) return;
  
  clearError();
  originalUrl = src;
  
  // Get smart URL (direct or via proxy)
  const streamInfo = await getSmartStreamUrl(src, forceProxy);
  const streamUrl = streamInfo.url;
  currentStreamMode.value = streamInfo.mode;
  useProxy.value = streamInfo.mode === "proxy";
  
  // Detect source type
  let type = "application/x-mpegURL";
  if (src.includes(".mp4")) {
    type = "video/mp4";
  } else if (src.includes(".webm")) {
    type = "video/webm";
  } else if (src.includes(".ts")) {
    type = "video/mp2t";
  }
  
  player.src({ src: streamUrl, type });
}

function retryStream() {
  if (retryCount.value >= MAX_RETRIES) {
    showError(locale.value === "fr" ? "Nombre max de tentatives atteint" : "Max retries reached", false);
    return;
  }
  
  retryCount.value++;
  clearError();
  
  // If direct mode failed, try with proxy
  if (!useProxy.value && originalUrl) {
    markAsCorsBlocked(originalUrl);
    loadSource(originalUrl, true);
  } else if (originalUrl && player) {
    loadSource(originalUrl, useProxy.value);
  }
}

function registerPluginSafe() {
  // Only register if not already registered
  if (!videojs.getPlugin("translatePlugin")) {
    videojs.registerPlugin("translatePlugin", translatePlugin);
  }
}

onMounted(async () => {
  await nextTick();
  
  if (!videoElement.value) return;
  
  try {
    registerPluginSafe();
    
    player = videojs(videoElement.value, {
      controls: true,
      autoplay: false,
      preload: "auto",
      width: "100%",
      height: "100%",
      language: locale.value === "fr" ? "fr" : "en",
      languages: {
        en: en,
        fr: fr,
      },
      html5: {
        vhs: {
          overrideNative: true,
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
        },
      },
      liveui: true,
    });

    player.translatePlugin();

    // Handle video errors with retry logic and proxy fallback
    player.on("error", () => {
      const error = player.error();
      if (!error) return;
      
      const errorCode = error.code;
      const message = getErrorMessage(errorCode);
      
      // On network error (CORS likely), try proxy if not already using it
      if (errorCode === 2 && !useProxy.value && originalUrl) {
        markAsCorsBlocked(originalUrl);
        showError(`${message} - ${locale.value === "fr" ? "Passage au proxy" : "Switching to proxy"}...`, false);
        
        retryTimeout = setTimeout(() => {
          loadSource(originalUrl, true);
        }, RETRY_DELAY);
      } else if (errorCode === 2 && retryCount.value < MAX_RETRIES) {
        // Already using proxy, do normal retry
        retryCount.value++;
        showError(`${message} - ${locale.value === "fr" ? "Nouvelle tentative" : "Retrying"}...`, false);
        
        retryTimeout = setTimeout(() => {
          if (originalUrl && player) {
            loadSource(originalUrl, useProxy.value);
          }
        }, RETRY_DELAY);
      } else {
        showError(message, errorCode !== 4);
      }
    });

    // Clear error on successful play
    player.on("playing", () => {
      clearError();
      retryCount.value = 0;
    });

    // Set initial source if available
    if (props.value) {
      loadSource(props.value);
    }

    // Add tracks if available
    if (tracks.value) {
      tracks.value.forEach(track => {
        player.addRemoteTextTrack(track, true);
      });
    }

    // Watch for source changes
    watch(() => props.value, (newValue) => {
      if (newValue && player) {
        retryCount.value = 0;
        loadSource(newValue);
      }
    });

    // Watch for language changes
    watch(locale, (newLocale) => {
      if (player) {
        player.language(newLocale === "fr" ? "fr" : "en");
      }
    });

    // Watch for track changes
    watch(tracks, (newTracks) => {
      if (player && newTracks) {
        const textTracks = player.textTracks();
        for (let i = textTracks.length - 1; i >= 0; i--) {
          player.removeRemoteTextTrack(textTracks[i]);
        }
        newTracks.forEach(track => {
          player.addRemoteTextTrack(track, true);
        });
        refreshTranslateBtn(player, t("translateBtn"));
      }
    });
  } catch (error) {
    showError(locale.value === "fr" ? "Erreur d'initialisation du lecteur" : "Player initialization error", false);
  }
});

// Cleanup on unmount
onBeforeUnmount(() => {
  if (retryTimeout) {
    clearTimeout(retryTimeout);
  }
  if (player) {
    player.dispose();
    player = null;
  }
});
</script>

<style scoped>
.video-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.error-content {
  text-align: center;
  color: #fff;
  padding: 2rem;
}

.error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ef4444;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 1rem;
}

.error-content p {
  margin: 0 0 1rem;
  font-size: 1.1rem;
}

.retry-btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #2563eb;
}
</style>
