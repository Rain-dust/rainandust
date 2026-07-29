export default {
  async fetch(request, env) {
    if (!env?.ASSETS?.fetch) {
      return new Response("Static assets are unavailable.", { status: 503 });
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || !["GET", "HEAD"].includes(request.method)) {
      return response;
    }

    const fallbackUrl = new URL("/404.html", request.url);
    const fallback = await env.ASSETS.fetch(new Request(fallbackUrl));
    if (!fallback.ok) return response;

    return new Response(request.method === "HEAD" ? null : fallback.body, {
      status: 404,
      statusText: "Not Found",
      headers: fallback.headers
    });
  },
};
