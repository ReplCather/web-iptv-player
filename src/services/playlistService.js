import axios from 'axios';
import { parse, suffix } from '../utils/tvlistsupport.js';
import { RADIO_KEYWORDS, HTTP_PROTOCOLS } from '../config/constants.js';

export async function fetchPlaylist(url) {
  try {
    const response = await axios.get(url, { timeout: 15000 });
    return response.data;
  } catch (error) {
    throw new PlaylistLoadError(url, error);
  }
}

export function parsePlaylist(data, url) {
  const suffixName = suffix(url);
  return parse(data, suffixName);
}

export function filterChannels(channels, filter) {
  if (!filter) return channels;

  const { name, groupTitle } = filter;
  const searchTerm = name?.toLowerCase() || '';
  const groupTerm = groupTitle?.toLowerCase() || '';

  return channels.filter(channel => {
    const channelName = (channel.name || '').toLowerCase();
    const channelGroup = (channel.meta?.['group-title'] || '').toLowerCase();

    if (searchTerm && !channelName.includes(searchTerm)) return false;
    if (groupTerm && !channelGroup.includes(groupTerm)) return false;

    return true;
  });
}

export function filterRadios(channels) {
  return channels.filter(channel => {
    if (!channel.isTv) return true;

    const name = (channel.name || '').toLowerCase();
    const groupTitle = (channel.meta?.['group-title'] || '').toLowerCase();

    return RADIO_KEYWORDS.some(keyword =>
      name.includes(keyword) || groupTitle.includes(keyword)
    );
  });
}

export function isValidStreamUrl(url) {
  if (!url) return false;
  return HTTP_PROTOCOLS.some(protocol => url.startsWith(protocol));
}

export function getFirstValidChannel(channels) {
  return channels.find(channel =>
    channel.isTv && isValidStreamUrl(channel.url)
  );
}

export class PlaylistLoadError extends Error {
  constructor(url, cause) {
    super(`Failed to load playlist: ${url}`);
    this.name = 'PlaylistLoadError';
    this.url = url;
    this.cause = cause;
  }
}
