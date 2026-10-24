const SITE = 'https://vrvlog.fun';

export default {
  fetch(request, env = {}) {
    const url = new URL(request.url);
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store',
      'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff' };
    if (request.headers.get('Origin') !== SITE) return new Response('{}', { status: 403, headers });
    headers['Access-Control-Allow-Origin'] = SITE;
    if (request.method !== 'GET' || url.pathname !== '/region' || url.search) {
      return new Response('{}', { status: 404, headers });
    }
    // Cloudflare supplies cf.country. Client-controlled country/language headers are ignored.
    // No IP address, request headers, country code or log is retained or forwarded.
    const measurement = env.MEASUREMENT_ENABLED === 'true' && request.cf?.country === 'JP' ? 'jp' : 'off';
    return new Response(JSON.stringify({ measurement }), { status: 200, headers });
  }
};
