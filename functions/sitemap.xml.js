
export async function onRequest(context) {
  const { env } = context;
  const apiKey = env.TMDB_API_KEY || '453752deba3272cd109112cd41127fd8';
  const baseUrl = 'https://vidplay.watch';

  // 1. Define Static Routes
  const staticRoutes = [
    '/',
    '/search',
    '/collections',
    '/login',
    '/signup'
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add Static Routes
  staticRoutes.forEach(route => {
    xml += `
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
  });

  try {
    // 2. Fetch Trending Movies & TV
    const [moviesRes, tvRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`),
      fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}`)
    ]);

    if (moviesRes.ok) {
      const moviesData = await moviesRes.json();
      moviesData.results.slice(0, 50).forEach(movie => {
        const slug = (movie.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        xml += `
  <url>
    <loc>${baseUrl}/movie/${movie.id}/${slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
      });
    }

    if (tvRes.ok) {
      const tvData = await tvRes.json();
      tvData.results.slice(0, 50).forEach(show => {
        const slug = (show.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        xml += `
  <url>
    <loc>${baseUrl}/tv/${show.id}/${slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
      });
    }

  } catch (err) {
    // Fail silently and return mostly static sitemap if API fails
    console.error("Sitemap generation error:", err);
  }

  xml += `
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    }
  });
}
