
export async function onRequest(context) {
  const { request, next, env } = context;
  const path = context.params.path; 

  if (!path || !Array.isArray(path) || path.length === 0) {
    return next();
  }

  const tvId = path[0];
  const apiKey = env.TMDB_API_KEY || '453752deba3272cd109112cd41127fd8';

  try {
    const tmdbRes = await fetch(`https://api.themoviedb.org/3/tv/${tvId}?api_key=${apiKey}&language=en-US`, {
      headers: {
        'User-Agent': 'VidPlay-Edge-Function/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (!tmdbRes.ok) {
        const errText = `API Error: ${tmdbRes.status}`;
        const res = await next();
        return new HTMLRewriter().transform(res);
    }

    const tv = await tmdbRes.json();
    
    const title = `${tv.name} (${(tv.first_air_date || '').split('-')[0]}) | VidPlay`;
    const description = tv.overview || 'Watch this TV show on VidPlay.';
    const image = tv.poster_path 
      ? `https://image.tmdb.org/t/p/w500${tv.poster_path}`
      : 'https://vidplay.watch/og-image.jpg';
    const pageUrl = request.url;

    const response = await next();

    const schema = {
      "@context": "https://schema.org",
      "@type": "TVSeries",
      "name": tv.name,
      "description": description,
      "image": image,
      "startDate": tv.first_air_date,
      "url": pageUrl,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": tv.vote_average || 0,
        "bestRating": "10",
        "ratingCount": tv.vote_count || 0
      }
    };

    return new HTMLRewriter()
      .on('title', { element(e) { e.setInnerContent(title); } })
      .on('meta[name="description"]', { element(e) { e.setAttribute('content', description); } })
      .on('meta[property="og:title"]', { element(e) { e.setAttribute('content', title); } })
      .on('meta[property="og:description"]', { element(e) { e.setAttribute('content', description); } })
      .on('meta[property="og:image"]', { element(e) { e.setAttribute('content', image); } })
      .on('meta[property="og:url"]', { element(e) { e.setAttribute('content', pageUrl); } })
      .on('head', { element(e) { e.append(`<script type="application/ld+json">${JSON.stringify(schema)}</script>`, { html: true }); } })
      .transform(response);

  } catch (err) {
    const res = await next();
    return new HTMLRewriter().transform(res);
  }
}
