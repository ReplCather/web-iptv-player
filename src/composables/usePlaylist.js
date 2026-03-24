import { ref, computed } from 'vue';
import { useI18n } from '../i18n/index.js';
import { playlistCache } from '../services/cacheService.js';
import {
  fetchPlaylist,
  parsePlaylist,
  filterRadios,
  getFirstValidChannel
} from '../services/playlistService.js';
import { getPlaylistUrl } from '../config/countries.js';
import { PLAYLIST_URLS, STORAGE_KEYS, SUPPORTED_MODES } from '../config/constants.js';

export function usePlaylist() {
  const { t } = useI18n();

  const channels = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const currentUrl = ref('');

  const hasChannels = computed(() => channels.value.length > 0);

  async function loadPlaylist(url, options = {}) {
    const { mode = SUPPORTED_MODES.HOME, preserveSelection = false } = options;

    if (!url) {
      url = localStorage.getItem(STORAGE_KEYS.TVLIST_URL) || PLAYLIST_URLS.LOCAL_TVLIST;
    }

    const cached = playlistCache.get(url);
    if (cached) {
      const data = mode === SUPPORTED_MODES.RADIO ? filterRadios(cached) : cached;
      channels.value = data;
      if (!preserveSelection) {
        selectFirstChannel();
      }
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const data = await fetchPlaylist(url);
      const parsed = parsePlaylist(data, url);

      playlistCache.set(url, parsed);

      const filtered = mode === SUPPORTED_MODES.RADIO ? filterRadios(parsed) : parsed;
      channels.value = filtered;
      currentUrl.value = url;

      if (mode === SUPPORTED_MODES.HOME) {
        localStorage.setItem(STORAGE_KEYS.TVLIST_URL, url);
      }

      if (!preserveSelection) {
        selectFirstChannel();
      }
    } catch (e) {
      error.value = e;
      channels.value = [{ name: t('failedToLoad'), isTv: false }];
    } finally {
      loading.value = false;
    }
  }

  function selectFirstChannel() {
    const first = getFirstValidChannel(channels.value);
    if (first) {
      return { url: first.url, caption: first.caption };
    }
    return null;
  }

  function clearCache() {
    playlistCache.clear();
  }

  function getPlaylistForMode(mode, countryCode) {
    switch (mode) {
      case SUPPORTED_MODES.IPTV:
        return PLAYLIST_URLS.GLOBAL_IPTV;
      case SUPPORTED_MODES.RADIO:
        return PLAYLIST_URLS.GLOBAL_IPTV;
      case SUPPORTED_MODES.HOME:
      default:
        return getPlaylistUrl(countryCode, SUPPORTED_MODES.HOME);
    }
  }

  return {
    channels,
    loading,
    error,
    hasChannels,
    currentUrl,
    loadPlaylist,
    selectFirstChannel,
    clearCache,
    getPlaylistForMode
  };
}
