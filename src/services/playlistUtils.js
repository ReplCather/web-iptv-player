import { parse, suffix } from '../utils/tvlistsupport';

export { parse, suffix };

export async function fetchAndParsePlaylist(url) {
  const { default: axios } = await import('axios');
  const response = await axios.get(url, { timeout: 15000 });
  const suffixName = suffix(url);
  return parse(response.data, suffixName);
}
