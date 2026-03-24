import { SUPPORTED_COUNTRIES } from '../config/countries.js';
import { IPTV_ORG_BASE } from '../config/constants.js';

const STORAGE_KEY = 'selectedCountry';
const DEFAULT_COUNTRY = 'FR';

export function getSelectedCountry() {
  let stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'UK') {
    stored = 'GB';
    localStorage.setItem(STORAGE_KEY, stored);
  }
  if (stored && SUPPORTED_COUNTRIES[stored]) {
    return stored;
  }
  return DEFAULT_COUNTRY;
}

export function setSelectedCountry(countryCode) {
  if (SUPPORTED_COUNTRIES[countryCode]) {
    localStorage.setItem(STORAGE_KEY, countryCode);
    return true;
  }
  return false;
}

export function getCountryInfo(countryCode) {
  return SUPPORTED_COUNTRIES[countryCode] || SUPPORTED_COUNTRIES[DEFAULT_COUNTRY];
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

export function getSupportedCountries() {
  return SUPPORTED_COUNTRIES;
}
