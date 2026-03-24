import { ref, computed } from 'vue';
import { getSupportedCountries, getCountryInfo, getFlagUrl, getSelectedCountry, setSelectedCountry } from '../services/geolocationService.js';

export function useCountry() {
  const selectedCountryCode = ref(getSelectedCountry());

  const countries = computed(() => getSupportedCountries());

  const currentCountry = computed(() =>
    getCountryInfo(selectedCountryCode.value)
  );

  const flagUrl = computed(() =>
    getFlagUrl(selectedCountryCode.value)
  );

  function setCountry(code) {
    if (countries.value[code]) {
      selectedCountryCode.value = code;
      setSelectedCountry(code);
    }
  }

  return {
    selectedCountryCode,
    countries,
    currentCountry,
    flagUrl,
    setCountry
  };
}
