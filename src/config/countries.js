import { IPTV_ORG_BASE } from './constants.js';

export const SUPPORTED_COUNTRIES = {
  FR: { name: 'France', code: 'fr', flag: 'fr' },
  GB: { name: 'United Kingdom', code: 'gb', flag: 'gb' },
  DE: { name: 'Germany', code: 'de', flag: 'de' },
  NL: { name: 'Netherlands', code: 'nl', flag: 'nl' },
  PT: { name: 'Portugal', code: 'pt', flag: 'pt' },
  TN: { name: 'Tunisia', code: 'tn', flag: 'tn' },
  ES: { name: 'Spain', code: 'es', flag: 'es' },
  IT: { name: 'Italy', code: 'it', flag: 'it' },
  US: { name: 'United States', code: 'us', flag: 'us' },
  CA: { name: 'Canada', code: 'ca', flag: 'ca' },
  BR: { name: 'Brazil', code: 'br', flag: 'br' },
  JP: { name: 'Japan', code: 'jp', flag: 'jp' },
  RU: { name: 'Russia', code: 'ru', flag: 'ru' },
  IN: { name: 'India', code: 'in', flag: 'in' },
  CN: { name: 'China', code: 'cn', flag: 'cn' },
  AR: { name: 'Argentina', code: 'ar', flag: 'ar' },
  MX: { name: 'Mexico', code: 'mx', flag: 'mx' },
  KR: { name: 'South Korea', code: 'kr', flag: 'kr' },
  TR: { name: 'Turkey', code: 'tr', flag: 'tr' },
  SA: { name: 'Saudi Arabia', code: 'sa', flag: 'sa' },
  EG: { name: 'Egypt', code: 'eg', flag: 'eg' },
  MA: { name: 'Morocco', code: 'ma', flag: 'ma' },
  DZ: { name: 'Algeria', code: 'dz', flag: 'dz' },
  BE: { name: 'Belgium', code: 'be', flag: 'be' },
  CH: { name: 'Switzerland', code: 'ch', flag: 'ch' },
  AT: { name: 'Austria', code: 'at', flag: 'at' },
  PL: { name: 'Poland', code: 'pl', flag: 'pl' },
  SE: { name: 'Sweden', code: 'se', flag: 'se' },
  NO: { name: 'Norway', code: 'no', flag: 'no' },
  DK: { name: 'Denmark', code: 'dk', flag: 'dk' },
  FI: { name: 'Finland', code: 'fi', flag: 'fi' },
  IE: { name: 'Ireland', code: 'ie', flag: 'ie' },
  GR: { name: 'Greece', code: 'gr', flag: 'gr' },
  HU: { name: 'Hungary', code: 'hu', flag: 'hu' },
  CZ: { name: 'Czech Republic', code: 'cz', flag: 'cz' },
  RO: { name: 'Romania', code: 'ro', flag: 'ro' },
  UA: { name: 'Ukraine', code: 'ua', flag: 'ua' },
  AU: { name: 'Australia', code: 'au', flag: 'au' },
  NZ: { name: 'New Zealand', code: 'nz', flag: 'nz' },
  ZA: { name: 'South Africa', code: 'za', flag: 'za' },
  NG: { name: 'Nigeria', code: 'ng', flag: 'ng' },
  KE: { name: 'Kenya', code: 'ke', flag: 'ke' },
  TH: { name: 'Thailand', code: 'th', flag: 'th' },
  VN: { name: 'Vietnam', code: 'vn', flag: 'vn' },
  ID: { name: 'Indonesia', code: 'id', flag: 'id' },
  MY: { name: 'Malaysia', code: 'my', flag: 'my' },
  SG: { name: 'Singapore', code: 'sg', flag: 'sg' },
  PH: { name: 'Philippines', code: 'ph', flag: 'ph' },
  PK: { name: 'Pakistan', code: 'pk', flag: 'pk' },
  BD: { name: 'Bangladesh', code: 'bd', flag: 'bd' },
  CL: { name: 'Chile', code: 'cl', flag: 'cl' },
  CO: { name: 'Colombia', code: 'co', flag: 'co' },
  PE: { name: 'Peru', code: 'pe', flag: 'pe' },
  VE: { name: 'Venezuela', code: 've', flag: 've' }
};

export function getSupportedCountries() {
  return SUPPORTED_COUNTRIES;
}

export function getCountryInfo(countryCode) {
  return SUPPORTED_COUNTRIES[countryCode] || SUPPORTED_COUNTRIES.FR;
}

export function getFlagUrl(countryCode) {
  const info = getCountryInfo(countryCode);
  return `https://flagcdn.com/${info.flag}.svg`;
}

export function getPlaylistUrl(countryCode, type) {
  const info = getCountryInfo(countryCode);
  const iso = info.code;

  const playlists = {
    home: `${IPTV_ORG_BASE}/countries/${iso}.m3u`,
    iptv: `${IPTV_ORG_BASE}/index.m3u`,
    radio: `${IPTV_ORG_BASE}/countries/${iso}.m3u`
  };

  return playlists[type] || playlists.home;
}
