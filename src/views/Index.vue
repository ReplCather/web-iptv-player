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
  </div>
</template>

<script setup>
import en from "video.js/dist/lang/en.json";
import fr from "video.js/dist/lang/fr.json";
import { computed, onMounted, ref, watch, nextTick, onBeforeUnmount } from "vue";
import { translatePlugin, refreshTranslateBtn } from "../utils/videojsPlugins";
import { useI18n } from "../i18n/index.js";
import videojs from "video.js";

const { t, locale } = useI18n();
const props = defineProps(["value", "track"]);
const videoElement = ref(null);
let player = null;

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

onMounted(async () => {
  await nextTick();
  
  if (!videoElement.value) return;
  
  try {
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
        hls: {
          overrideNative: true,
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
        },
      },
    });

    videojs.registerPlugin("translatePlugin", translatePlugin);
    player.translatePlugin();

    // Handle video errors
    player.on("error", () => {
      const errorCode = player.error()?.code;
      console.error("[v0] Video error code:", errorCode);
    });

    // Set initial source if available
    if (props.value) {
      player.src({ src: props.value, type: "application/x-mpegURL" });
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
        console.log("[v0] Loading stream:", newValue);
        player.src({ src: newValue, type: "application/x-mpegURL" });
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
        // Remove existing tracks
        const textTracks = player.textTracks();
        for (let i = textTracks.length - 1; i >= 0; i--) {
          player.removeRemoteTextTrack(textTracks[i]);
        }
        // Add new tracks
        newTracks.forEach(track => {
          player.addRemoteTextTrack(track, true);
        });
        refreshTranslateBtn(player, t("translateBtn"));
      }
    });
  } catch (error) {
    console.error("[v0] Failed to initialize video player:", error);
  }
});

// Cleanup on unmount
onBeforeUnmount(() => {
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
}
</style>
