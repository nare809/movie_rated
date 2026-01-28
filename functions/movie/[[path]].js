
export async function onRequest(context) {
  const { request, next, env } = context;
  const path = context.params.path; 

  if (!path || !Array.isArray(path) || path.length === 0) {
    return next();
  }

  const movieId = path[0];
  const apiKey = env.TMDB_API_KEY || '453752deba3272cd109112cd41127fd8';

  try {
    const tmdbRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`, {
      headers: {
        'User-Agent': 'VidPlay-Edge-Function/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (!tmdbRes.ok) {
        // Debug: Inject error status
        const errText = `API Error: ${tmdbRes.status}`;
        const res = await next();
        return new HTMLRewriter().transform(res);
    }

    const movie = await tmdbRes.json();
    
    const title = `${movie.title} (${(movie.release_date || '').split('-')[0]}) | VidPlay`;
    const description = movie.overview || 'Watch this movie on VidPlay.';
    const image = movie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://vidplay.watch/og-image.jpg';
    const pageUrl = request.url;

    const response = await next();
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "Movie",
      "name": movie.title,
      "description": description,
      "image": image,
      "datePublished": movie.release_date,
      "url": pageUrl,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": movie.vote_average || 0,
        "bestRating": "10",
        "ratingCount": movie.vote_count || 0
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
