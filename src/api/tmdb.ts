import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// Unified Media Interface
export interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  vote_average: number;
}

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type?: 'movie' | 'tv';
  popularity: number;
  seasons?: Season[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  vote_count?: number;
  original_language?: string;
  genres?: { id: number; name: string }[];
}

export interface MediaResponse {
  page: number;
  results: MediaItem[];
  total_pages: number;
  total_results: number;
}

export const getTrendingAll = async (timeWindow: 'day' | 'week' = 'day'): Promise<MediaResponse> => {
  const response = await tmdb.get(`/trending/all/${timeWindow}`);
  return response.data;
};

export const getMonthlyTrendingAll = async (): Promise<MediaResponse> => {
  // Fetch both Movie and TV discover for last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
  const formattedToday = new Date().toISOString().split('T')[0];

  const [movieRes, tvRes] = await Promise.all([
    tmdb.get('/discover/movie', {
       params: {
          'primary_release_date.gte': thirtyDaysAgo,
          'primary_release_date.lte': formattedToday,
          sort_by: 'popularity.desc',
       }
    }),
    tmdb.get('/discover/tv', {
       params: {
          'first_air_date.gte': thirtyDaysAgo,
          'first_air_date.lte': formattedToday,
          sort_by: 'popularity.desc',
       }
    })
  ]);

  // Mix and Sort
  const movies = movieRes.data.results.map((m: any) => ({ ...m, media_type: 'movie' }));
  const tvs = tvRes.data.results.map((t: any) => ({ ...t, media_type: 'tv' }));
  const mixed = [...movies, ...tvs].sort((a, b) => b.popularity - a.popularity);

  return { ...movieRes.data, results: mixed };
};

export const getTotalTrendingAll = async (): Promise<MediaResponse> => {
   // Fetch Popular Movies and TV, Mix and Sort
  const [movieRes, tvRes] = await Promise.all([
     tmdb.get('/movie/popular'),
     tmdb.get('/tv/popular')
  ]);
  
  const movies = movieRes.data.results.map((m: any) => ({ ...m, media_type: 'movie' }));
  const tvs = tvRes.data.results.map((t: any) => ({ ...t, media_type: 'tv' }));
  const mixed = [...movies, ...tvs].sort((a, b) => b.popularity - a.popularity);

  return { ...movieRes.data, results: mixed };
};

// Helper for filter merging
export interface DiscoverParams {
  sort_by?: string;
  with_genres?: string;
  region?: string;      // for movies
  with_origin_country?: string; // for tv
  primary_release_year?: number;
  first_air_date_year?: number;
  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
  'first_air_date.gte'?: string;
  'first_air_date.lte'?: string;
}

export const discoverMedia = async (
  type: 'all' | 'movie' | 'tv', 
  filters: { language?: string; genre?: string; sort?: string; year?: number; dateRange?: { start: string, end: string } },
  page: number = 1
): Promise<MediaResponse> => {
  
  // Mappings
  const sortMap: Record<string, string> = {
    'Recently Released': 'primary_release_date.desc', // specific logic needed for TV (first_air_date)
    'Recently Nice Rating': 'vote_average.desc', // simplistic
    'Highest Rating': 'vote_average.desc',
    'Most Hits': 'popularity.desc',
    'Oldest': 'primary_release_date.asc',
    'Newest': 'primary_release_date.desc',
  };

  const apiSort = sortMap[filters.sort || 'Recently Released'] || 'popularity.desc';
  // Adjust sort key for TV if needed
  const apiSortTV = apiSort.replace('primary_release_date', 'first_air_date');

  const params: any = {
    page,
    sort_by: apiSort,
    with_genres: filters.genre,
  };

  if (filters.language && filters.language !== 'All Language') {
    params.with_original_language = filters.language;
  }

  const today = new Date().toISOString().split('T')[0];
  // Filter out future dates unless explicitly requested, or if dateRange/year is missing
  if (!filters.year && !filters.dateRange) {
     params['primary_release_date.lte'] = today;
     params['first_air_date.lte'] = today;
  }

  // Date/Period Logic
  if (filters.year) {
     params.primary_release_year = filters.year;
     params.first_air_date_year = filters.year;
  } else if (filters.dateRange) {
     params['primary_release_date.gte'] = filters.dateRange.start;
     params['primary_release_date.lte'] = filters.dateRange.end;
     params['first_air_date.gte'] = filters.dateRange.start;
     params['first_air_date.lte'] = filters.dateRange.end;
  }

  if (type === 'movie') {
     const res = await tmdb.get('/discover/movie', { params });
     return { ...res.data, results: res.data.results.map((m: any) => ({ ...m, media_type: 'movie' })) };
  } 
  
  if (type === 'tv') {
     const tvParams = { ...params, sort_by: apiSortTV };
     const res = await tmdb.get('/discover/tv', { params: tvParams });
     return { ...res.data, results: res.data.results.map((t: any) => ({ ...t, media_type: 'tv' })) };
  }

  // 'all': Mixed (Fetch both & Merge)
  const [movieRes, tvRes] = await Promise.all([
     tmdb.get('/discover/movie', { params }),
     tmdb.get('/discover/tv', { params: { ...params, sort_by: apiSortTV } })
  ]);

  const movies = movieRes.data.results.map((m: any) => ({ ...m, media_type: 'movie' }));
  const tvs = tvRes.data.results.map((t: any) => ({ ...t, media_type: 'tv' }));
  
  // Basic merge & sort (Client side sort for the mixed page)
  const mixed = [...movies, ...tvs].sort((a, b) => {
     if (apiSort.includes('popularity')) return b.popularity - a.popularity;
     if (apiSort.includes('vote_average')) return b.vote_average - a.vote_average;
     // Date sort
     const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
     const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
     return apiSort.includes('asc') ? dateA - dateB : dateB - dateA;
  });

  // Calculate mixed total pages (approximate)
  const maxPages = Math.max(movieRes.data.total_pages, tvRes.data.total_pages);

  return { ...movieRes.data, results: mixed, total_pages: maxPages };
};

export const getMoviesByGenre = async (genreId: number): Promise<MediaResponse> => {
  const response = await tmdb.get('/discover/movie', {
    params: {
      with_genres: genreId,
    },
  });
  // Map to MediaItem
  const results = response.data.results.map((m: any) => ({ ...m, media_type: 'movie' }));
  return { ...response.data, results };
};

export const searchMovies = async (query: string): Promise<MovieResponse> => {
  const response = await tmdb.get('/search/movie', {
    params: {
      query,
    },
  });
  return response.data;
};

export const searchMulti = async (query: string): Promise<MediaResponse> => {
  const response = await tmdb.get('/search/multi', {
    params: {
      query,
    },
  });
  return response.data;
};

export interface MovieDetails extends Movie {
  runtime: number;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  original_language: string;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string }[];
  number_of_seasons?: number;
  seasons?: {
      air_date: string;
      episode_count: number;
      id: number;
      name: string;
      overview: string;
      poster_path: string;
      season_number: number;
      vote_average: number;
  }[];
}

export interface Episode {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string;
  vote_average: number;
  vote_count: number;
}

export interface SeasonDetails {
  _id: string;
  air_date: string;
  episodes: Episode[];
  name: string;
  overview: string;
  id: number;
  poster_path: string;
  season_number: number;
}

export const getTVSeasonDetails = async (tvId: string, seasonNumber: number): Promise<SeasonDetails> => {
  const response = await tmdb.get(`/tv/${tvId}/season/${seasonNumber}`);
  return response.data;
};

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

export interface CreditsResponse {
  id: number;
  cast: Cast[];
}

export interface Video {
  key: string;
  site: string;
  type: string;
}

export interface VideosResponse {
  id: number;
  results: Video[];
}

export interface ExternalIds {
  imdb_id?: string | null;
  facebook_id?: string | null;
  instagram_id?: string | null;
  twitter_id?: string | null;
}

export const getMediaDetails = async (id: string, type: 'movie' | 'tv'): Promise<MovieDetails & { external_ids?: ExternalIds }> => {
   const endpoint = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
   const response = await tmdb.get(endpoint, {
      params: {
         append_to_response: 'external_ids'
      }
   });
   // Normalize TV response to match MovieDetails (title vs name, release_date vs first_air_date)
   if (type === 'tv') {
      const d = response.data;
      return {
         ...d,
         media_type: 'tv',
         title: d.name,
         original_title: d.original_name,
         release_date: d.first_air_date,
         runtime: d.episode_run_time?.[0] || 0, // Approx
      };
   }
   return { ...response.data, media_type: 'movie' };
};



export const getMediaCredits = async (id: string, type: 'movie' | 'tv'): Promise<CreditsResponse> => {
  const endpoint = type === 'movie' ? `/movie/${id}/credits` : `/tv/${id}/credits`;
  const response = await tmdb.get(endpoint);
  return response.data;
};



export const getMediaVideos = async (id: string, type: 'movie' | 'tv'): Promise<VideosResponse> => {
  const endpoint = type === 'movie' ? `/movie/${id}/videos` : `/tv/${id}/videos`;
  const response = await tmdb.get(endpoint);
  return response.data;
};



export const getSimilarMedia = async (id: string, type: 'movie' | 'tv'): Promise<MovieResponse> => {
  const endpoint = type === 'movie' ? `/movie/${id}/similar` : `/tv/${id}/similar`;
  const response = await tmdb.get(endpoint);
  // Normalize results
  const results = response.data.results.map((item: any) => ({
      ...item,
      title: item.title || item.name,
      release_date: item.release_date || item.first_air_date,
  }));
  return { ...response.data, results };
};



export interface Review {
  id: string;
  author: string;
  content: string;
  author_details: {
    avatar_path: string | null;
    rating: number | null;
  };
  created_at: string;
}

export interface ReviewsResponse {
  id: number;
  results: Review[];
}

export const getMediaReviews = async (id: string, type: 'movie' | 'tv'): Promise<ReviewsResponse> => {
  const endpoint = type === 'movie' ? `/movie/${id}/reviews` : `/tv/${id}/reviews`;
  const response = await tmdb.get(endpoint);
  return response.data;
};



export interface Genre {
  id: number;
  name: string;
}

export interface GenreResponse {
  genres: Genre[];
}

export const getGenres = async (): Promise<GenreResponse> => {
  const response = await tmdb.get('/genre/movie/list');
  return response.data;
};
export interface CollectionPart {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
}

export interface CollectionDetails {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  parts: CollectionPart[];
}

export const getCollectionDetails = async (id: number): Promise<CollectionDetails> => {
  const response = await tmdb.get(`/collection/${id}`);
  return response.data;
};
