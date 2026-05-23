export const HTTP_PROTOCOLS = ['http://', 'https://'];

export const RADIO_KEYWORDS = ['radio', 'fm', 'audio'];

export const STORAGE_KEYS = {
  TVLIST_URL: 'tvlistUrl',
  SELECTED_COUNTRY: 'selectedCountry'
};

export const DEFAULT_COUNTRY = 'FR';

export const PLAYLIST_URLS = {
  LOCAL_TVLIST: '/tvlist.txt',
  GLOBAL_IPTV: 'https://iptv-org.github.io/iptv/index.m3u'
};

// Curated list of reliable IPTV sources (updated 2026)
export const IPTV_SOURCES = {
  // Main sources - most reliable and maintained
  IPTV_ORG: {
    name: 'IPTV-Org (Global)',
    url: 'https://iptv-org.github.io/iptv/index.m3u',
    description: 'Largest open-source IPTV collection, daily updates'
  },
  FREE_TV: {
    name: 'Free-TV (Legal HD)',
    url: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8',
    description: 'Clean and stable, legal free HD channels'
  },
  
  // Regional sources
  IPTV_ORG_FR: {
    name: 'France',
    url: 'https://iptv-org.github.io/iptv/countries/fr.m3u',
    country: 'FR'
  },
  IPTV_ORG_US: {
    name: 'United States',
    url: 'https://iptv-org.github.io/iptv/countries/us.m3u',
    country: 'US'
  },
  IPTV_ORG_UK: {
    name: 'United Kingdom',
    url: 'https://iptv-org.github.io/iptv/countries/uk.m3u',
    country: 'GB'
  },
  IPTV_ORG_DE: {
    name: 'Germany',
    url: 'https://iptv-org.github.io/iptv/countries/de.m3u',
    country: 'DE'
  },
  IPTV_ORG_ES: {
    name: 'Spain',
    url: 'https://iptv-org.github.io/iptv/countries/es.m3u',
    country: 'ES'
  },
  IPTV_ORG_IT: {
    name: 'Italy',
    url: 'https://iptv-org.github.io/iptv/countries/it.m3u',
    country: 'IT'
  },
  IPTV_ORG_PT: {
    name: 'Portugal',
    url: 'https://iptv-org.github.io/iptv/countries/pt.m3u',
    country: 'PT'
  },
  IPTV_ORG_BR: {
    name: 'Brazil',
    url: 'https://iptv-org.github.io/iptv/countries/br.m3u',
    country: 'BR'
  },
  IPTV_ORG_CA: {
    name: 'Canada',
    url: 'https://iptv-org.github.io/iptv/countries/ca.m3u',
    country: 'CA'
  },
  IPTV_ORG_MX: {
    name: 'Mexico',
    url: 'https://iptv-org.github.io/iptv/countries/mx.m3u',
    country: 'MX'
  },
  IPTV_ORG_AR: {
    name: 'Argentina',
    url: 'https://iptv-org.github.io/iptv/countries/ar.m3u',
    country: 'AR'
  },
  IPTV_ORG_JP: {
    name: 'Japan',
    url: 'https://iptv-org.github.io/iptv/countries/jp.m3u',
    country: 'JP'
  },
  IPTV_ORG_KR: {
    name: 'South Korea',
    url: 'https://iptv-org.github.io/iptv/countries/kr.m3u',
    country: 'KR'
  },
  IPTV_ORG_IN: {
    name: 'India',
    url: 'https://iptv-org.github.io/iptv/countries/in.m3u',
    country: 'IN'
  },
  IPTV_ORG_RU: {
    name: 'Russia',
    url: 'https://iptv-org.github.io/iptv/countries/ru.m3u',
    country: 'RU'
  },
  IPTV_ORG_NL: {
    name: 'Netherlands',
    url: 'https://iptv-org.github.io/iptv/countries/nl.m3u',
    country: 'NL'
  },
  IPTV_ORG_BE: {
    name: 'Belgium',
    url: 'https://iptv-org.github.io/iptv/countries/be.m3u',
    country: 'BE'
  },
  IPTV_ORG_CH: {
    name: 'Switzerland',
    url: 'https://iptv-org.github.io/iptv/countries/ch.m3u',
    country: 'CH'
  },
  IPTV_ORG_PL: {
    name: 'Poland',
    url: 'https://iptv-org.github.io/iptv/countries/pl.m3u',
    country: 'PL'
  },
  IPTV_ORG_TR: {
    name: 'Turkey',
    url: 'https://iptv-org.github.io/iptv/countries/tr.m3u',
    country: 'TR'
  },
  
  // Category-based playlists
  IPTV_ORG_NEWS: {
    name: 'News',
    url: 'https://iptv-org.github.io/iptv/categories/news.m3u',
    category: 'news'
  },
  IPTV_ORG_SPORTS: {
    name: 'Sports',
    url: 'https://iptv-org.github.io/iptv/categories/sports.m3u',
    category: 'sports'
  },
  IPTV_ORG_MUSIC: {
    name: 'Music',
    url: 'https://iptv-org.github.io/iptv/categories/music.m3u',
    category: 'music'
  },
  IPTV_ORG_MOVIES: {
    name: 'Movies',
    url: 'https://iptv-org.github.io/iptv/categories/movies.m3u',
    category: 'movies'
  },
  IPTV_ORG_KIDS: {
    name: 'Kids',
    url: 'https://iptv-org.github.io/iptv/categories/kids.m3u',
    category: 'kids'
  },
  IPTV_ORG_DOCUMENTARY: {
    name: 'Documentary',
    url: 'https://iptv-org.github.io/iptv/categories/documentary.m3u',
    category: 'documentary'
  },
  IPTV_ORG_ENTERTAINMENT: {
    name: 'Entertainment',
    url: 'https://iptv-org.github.io/iptv/categories/entertainment.m3u',
    category: 'entertainment'
  }
};

// Helper to get sources by type
export function getSourcesByCountry(countryCode) {
  return Object.values(IPTV_SOURCES).filter(s => s.country === countryCode);
}

export function getSourcesByCategory(category) {
  return Object.values(IPTV_SOURCES).filter(s => s.category === category);
}

export function getMainSources() {
  return Object.values(IPTV_SOURCES).filter(s => !s.country && !s.category);
}

export const SUPPORTED_MODES = {
  HOME: 'home',
  IPTV: 'iptv',
  RADIO: 'radio'
};

export const IPTV_ORG_BASE = 'https://iptv-org.github.io/iptv';

export const EPG_SOURCES = {
  IPTV_ORG: 'https://iptv-org.github.io/epg/guide.xml'
};

export const CACHE_CONFIG = {
  MAX_SIZE: 10,
  TTL: 1000 * 60 * 60 * 24
};
