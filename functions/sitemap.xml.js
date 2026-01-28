
export async function onRequest(context) {
  const { env } = context;
  const apiKey = env.TMDB_API_KEY || '453752deba3272cd109112cd41127fd8';
  const baseUrl = 'https://vidplay.watch';

  // Helper to escape XML special characters
  const escapeXml = (unsafe) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
      return c;
    });
  };

  // 1. Define Static Routes
  const staticRoutes = [
    '/',
    '/search',
    '/collections',
    '/login',
    '/signup'
  ];

  let urlEntries = [];

  // Add Static Routes
  staticRoutes.forEach(route => {
    urlEntries.push(`
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`);
  });

  try {
    // 2. Fetch Trending Movies & TV with timeout
    const fetchWithTimeout = async (url, timeout = 5000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return response;
      } catch (e) {
        clearTimeout(id);
        throw e;
      }
    };

    const [moviesRes, tvRes] = await Promise.allSettled([
      fetchWithTimeout(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`),
      fetchWithTimeout(`https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}`)
    ]);

    if (moviesRes.status === 'fulfilled' && moviesRes.value.ok) {
      const moviesData = await moviesRes.value.json();
      if (moviesData.results) {
        moviesData.results.slice(0, 50).forEach(movie => {
          const rawSlug = (movie.title || movie.original_title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const slug = escapeXml(rawSlug);
          if (movie.id) {
            urlEntries.push(`
  <url>
    <loc>${baseUrl}/movie/${movie.id}/${slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`);
          }
        });
      }
    }

    if (tvRes.status === 'fulfilled' && tvRes.value.ok) {
      const tvData = await tvRes.value.json();
      if (tvData.results) {
        tvData.results.slice(0, 50).forEach(show => {
          const rawSlug = (show.name || show.original_name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const slug = escapeXml(rawSlug);
          if (show.id) {
            urlEntries.push(`
  <url>
    <loc>${baseUrl}/tv/${show.id}/${slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`);
          }
        });
      }
    }

  } catch (err) {
    console.error("Sitemap generation error:", err);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
