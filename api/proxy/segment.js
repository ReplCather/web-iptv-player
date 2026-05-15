/**
 * Proxy API pour les segments video (.ts, .m4s, .aac, etc.)
 * Optimise pour le streaming avec support Range requests
 */

export const config = {
  runtime: 'edge',
};

const TIMEOUT_MS = 30000; // Plus long pour les segments video

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

    // Build headers
    const headers = new Headers();
    const userAgent = request.headers.get('user-agent');
    if (userAgent) {
      headers.set('User-Agent', userAgent);
    }
    
    // Forward Range header for seeking support
    const rangeHeader = request.headers.get('range');
    if (rangeHeader) {
      headers.set('Range', rangeHeader);
    }
    
    // IPTV provider headers
    headers.set('Referer', parsedUrl.origin);
    headers.set('Origin', parsedUrl.origin);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok && response.status !== 206) {
      return new Response(JSON.stringify({ 
        error: 'Upstream error', 
        status: response.status 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build response headers
    const responseHeaders = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
    });

    // Forward important headers from upstream
    const headersToForward = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
    ];

    for (const header of headersToForward) {
      const value = response.headers.get(header);
      if (value) {
        responseHeaders.set(header, value);
      }
    }

    // Default content type for video segments
    if (!responseHeaders.has('content-type')) {
      if (targetUrl.endsWith('.ts')) {
        responseHeaders.set('content-type', 'video/mp2t');
      } else if (targetUrl.endsWith('.m4s')) {
        responseHeaders.set('content-type', 'video/iso.segment');
      } else if (targetUrl.endsWith('.aac')) {
        responseHeaders.set('content-type', 'audio/aac');
      } else {
        responseHeaders.set('content-type', 'application/octet-stream');
      }
    }

    // Stream the response body
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
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
