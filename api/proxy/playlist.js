/**
 * Proxy API pour les playlists m3u/m3u8
 * Contourne CORS et reecrit les URLs pour passer par le proxy
 */

const ALLOWED_EXTENSIONS = ['.m3u', '.m3u8', '.ts', '.m4s', '.mp4', '.aac', '.vtt'];
const TIMEOUT_MS = 15000;

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  
  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate URL
  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Security: only allow http/https
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return new Response(JSON.stringify({ error: 'Invalid protocol' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Forward relevant headers from original request
    const headers = new Headers();
    const userAgent = request.headers.get('user-agent');
    if (userAgent) {
      headers.set('User-Agent', userAgent);
    }
    
    // Some IPTV providers check referer
    headers.set('Referer', parsedUrl.origin);
    headers.set('Origin', parsedUrl.origin);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return new Response(JSON.stringify({ 
        error: 'Upstream error', 
        status: response.status 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const contentType = response.headers.get('content-type') || '';
    const isPlaylist = contentType.includes('mpegurl') || 
                       contentType.includes('x-mpegurl') ||
                       contentType.includes('vnd.apple.mpegurl') ||
                       targetUrl.endsWith('.m3u8') || 
                       targetUrl.endsWith('.m3u');

    if (isPlaylist) {
      // Parse and rewrite playlist URLs
      let content = await response.text();
      content = rewritePlaylistUrls(content, parsedUrl, url.origin);
      
      return new Response(content, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // For non-playlist content, stream through
    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });

  } catch (error) {
    if (error.name === 'AbortError') {
      return new Response(JSON.stringify({ error: 'Request timeout' }), {
        status: 504,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Proxy error', 
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Rewrite URLs in m3u8 playlist to go through proxy
 */
function rewritePlaylistUrls(content, baseUrl, proxyOrigin) {
  const lines = content.split('\n');
  const rewritten = lines.map(line => {
    const trimmed = line.trim();
    
    // Skip empty lines and comments (except URI in comments)
    if (!trimmed || (trimmed.startsWith('#') && !trimmed.includes('URI='))) {
      // Handle URI= in EXT-X-KEY and similar tags
      if (trimmed.includes('URI="')) {
        return rewriteUriInTag(trimmed, baseUrl, proxyOrigin);
      }
      return line;
    }
    
    // Skip non-URL lines
    if (trimmed.startsWith('#')) {
      return line;
    }
    
    // Rewrite segment/playlist URLs
    const absoluteUrl = resolveUrl(trimmed, baseUrl);
    return `${proxyOrigin}/api/proxy/playlist?url=${encodeURIComponent(absoluteUrl)}`;
  });
  
  return rewritten.join('\n');
}

/**
 * Rewrite URI= attributes in tags like EXT-X-KEY
 */
function rewriteUriInTag(line, baseUrl, proxyOrigin) {
  return line.replace(/URI="([^"]+)"/g, (match, uri) => {
    const absoluteUrl = resolveUrl(uri, baseUrl);
    return `URI="${proxyOrigin}/api/proxy/playlist?url=${encodeURIComponent(absoluteUrl)}"`;
  });
}

/**
 * Resolve relative URL to absolute
 */
function resolveUrl(url, baseUrl) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}
