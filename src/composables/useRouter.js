import { ref, computed } from 'vue';

export function useRouter() {
  const currentHash = ref(window.location.hash);

  window.addEventListener('hashchange', () => {
    currentHash.value = window.location.hash;
  });

  const path = computed(() => {
    const hash = currentHash.value;
    const hashPath = hash.slice(1).split('?')[0];
    return hashPath || '/';
  });

  const queryParams = computed(() => {
    const hash = currentHash.value;
    if (!hash.includes('?')) return {};

    const queryString = hash.slice(hash.indexOf('?') + 1);
    const params = new URLSearchParams(queryString);
    const result = {};

    params.forEach((value, key) => {
      result[key] = decodeURIComponent(value);
    });

    return result;
  });

  function navigate(path, query = {}) {
    const queryString = Object.entries(query)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');

    const newHash = queryString ? `#${path}?${queryString}` : `#${path}`;
    window.location.hash = newHash;
  }

  function updateQuery(params) {
    const current = queryParams.value;
    const merged = { ...current, ...params };
    navigate(path.value, merged);
  }

  return {
    currentHash,
    path,
    queryParams,
    navigate,
    updateQuery
  };
}
