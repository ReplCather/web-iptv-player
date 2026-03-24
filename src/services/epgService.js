import axios from 'axios';
import { EPG_SOURCES } from '../config/constants.js';

let guidesCache = null;

export async function fetchGuides() {
  if (guidesCache) return guidesCache;
  
  try {
    const response = await axios.get(EPG_SOURCES.IPTV_ORG, { timeout: 15000 });
    guidesCache = response.data;
    return guidesCache;
  } catch (error) {
    console.error('Failed to fetch guides:', error);
    return [];
  }
}

export async function fetchXMLGuide(url) {
  try {
    const response = await axios.get(url, { 
      timeout: 30000,
      headers: { 'Accept': 'application/xml' }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch XML guide:', error);
    return null;
  }
}

export function findGuideForChannel(channelName, guides) {
  if (!guides || !guides.length) return null;
  
  const normalizedName = channelName.toLowerCase().trim();
  
  return guides.find(guide => {
    if (!guide.channel) return false;
    const guideName = guide.channel.toLowerCase();
    return guideName === normalizedName || 
           guideName.includes(normalizedName) ||
           normalizedName.includes(guideName);
  });
}

export function getGuideUrl(guide) {
  if (!guide) return null;
  
  const site = guide.site;
  if (!site) return null;
  
  return `https://iptv-org.github.io/epg/${site}.xml`;
}

export async function getChannelGuide(channelName) {
  const guides = await fetchGuides();
  const guide = findGuideForChannel(channelName, guides);
  
  if (!guide) return null;
  
  return {
    site: guide.site,
    siteId: guide.site_id,
    siteName: guide.site_name,
    lang: guide.lang,
    url: getGuideUrl(guide)
  };
}