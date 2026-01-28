import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Plus, ThumbsUp, Sparkles, Play, Star, ChevronDown, Calendar, ArrowUpRight, Heart } from 'lucide-react'; // Using Lucide icons to match
import { getMediaDetails, getMediaCredits, getTVSeasonDetails, getSimilarMedia, getMediaReviews } from '../../api/tmdb';
import type { MediaItem, Review } from '../../api/tmdb';
import Loader from '../common/Loader';
import { useAuth } from '../../context/AuthContext';
import { UserService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { slugify } from '../../utils/slug';

import SEO from '../common/SEO';

const TopCast = ({ movieId, mediaType }: { movieId: string, mediaType: 'movie' | 'tv' }) => {
   const { data: credits } = useQuery({
      queryKey: ['credits', mediaType, movieId],
      queryFn: () => getMediaCredits(movieId, mediaType),
      enabled: !!movieId,
   });

   if (!credits?.cast?.length) return null;

   return (
      <>
         {credits.cast.slice(0, 8).map(person => (
            <div key={person.id} className="w-20 shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
               <div className="w-16 h-16 rounded-full overflow-hidden border border-black/10 dark:border-white/10 group-hover:border-primary transition-colors shadow-lg">
                  {person.profile_path ? (
                     <img src={`https://image.tmdb.org/t/p/w200${person.profile_path}`} className="w-full h-full object-cover" alt={person.name} />
                  ) : (
                     <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">N/A</div>
                  )}
               </div>
               <div className="text-center">
                  <div className="text-foreground text-[10px] font-bold line-clamp-1 group-hover:text-primary transition-colors">{person.name}</div>
                  <div className="text-muted-foreground text-[9px] line-clamp-1">{person.character}</div>
               </div>
            </div>
         ))}
      </>
   );
};

interface MovieDetailModalProps {
  movieId: string;
  mediaType?: 'movie' | 'tv';
  onClose: () => void;
}

import { useUserLibrary } from '../../hooks/useUserLibrary';

const MovieDetailModal: React.FC<MovieDetailModalProps> = ({ movieId, mediaType = 'movie', onClose }) => {
  const navigate = useNavigate();
  const { user, openAlertModal } = useAuth();
  const { isFavorite, isWatchlisted, addFavorite, removeFavorite, addWatchlist, removeWatchlist } = useUserLibrary();

  const isFav = isFavorite(Number(movieId));
  const isWatch = isWatchlisted(Number(movieId));

  const [userRating, setUserRating] = useState<number>(() => {
      const cached = localStorage.getItem('userRatings');
      if (cached) {
          const ratings = JSON.parse(cached);
          const key = `${mediaType}_${movieId}`; 
          return ratings[key] || 0;
      }
      return 0;
  });
  const [reviewSort, setReviewSort] = useState<'Newest' | 'Commented'>('Newest');
  
  // Random vote count
  const [siteVoteCount, setSiteVoteCount] = useState<number>(() => {
     const numericId = parseInt(movieId.replace(/\D/g, '') || '0');
     return 150 + (numericId % 800); 
  });
  const [selectedSeason, setSelectedSeason] = useState<number>(1);

  // Scroll to top on mount
   useEffect(() => {
      const modalContent = document.getElementById('modal-content');
      if (modalContent) modalContent.scrollTop = 0;
   }, [movieId, mediaType]);

   const toggleFavorite = async () => {
     if (!user) {
        openAlertModal("Sign in to love this title and save it to your favourites!");
        return;
     }

     try {
       if (isFav) {
         await removeFavorite(Number(movieId));
       } else if (movie) {
         await addFavorite(movie);
       }
     } catch (error) {
       console.error("Failed to update favorite", error);
     }
   };

   const toggleWatchlist = async () => {
     if (!user) {
        openAlertModal("Add this to your watchlist to keep track of what you want to watch next!");
        return;
     }
    
     try {
       if (isWatch) {
         await removeWatchlist(Number(movieId));
       } else if (movie) {
         await addWatchlist(movie);
       }
     } catch (error) {
       console.error("Failed to update watchlist", error);
     }
   };

    const handleWatch = async () => {
      // Track valid watch history non-blocking (fire-and-forget)
      if (movie) {
         UserService.addToContinueWatching(user?.uid || null, { ...movie, media_type: mediaType } as MediaItem)
            .catch(e => console.error("Failed to track continue watching", e));
      }
      
      const titleSlug = movie ? slugify(movie.title || '') : '';

      if (mediaType === 'movie') {
        navigate(`/watch/movie/${movieId}/${titleSlug}`);
      } else {
        // TV Logic: Default to S1E1 if no details
         let targetSeason = 1;
         const targetEpisode = 1;
         
         // Try to find first valid season (usually season 1, skip season 0/Specials if desired, or just take first)
         if (movie?.seasons?.length) {
             const validSeason = movie.seasons.find((s) => s.season_number > 0) || movie.seasons[0];
             if (validSeason) targetSeason = validSeason.season_number;
         }
         
         navigate(`/watch/tv/${movieId}/${targetSeason}/${targetEpisode}/${titleSlug}`);
      }
    };

  const handleRate = (rating: number) => {
      // If user hasn't rated yet (userRating was 0), increment count
      if (userRating === 0) {
          setSiteVoteCount(prev => prev + 1);
      }
      setUserRating(rating);
      const cachedRatings = localStorage.getItem('userRatings');
      const ratings = cachedRatings ? JSON.parse(cachedRatings) : {};
      ratings[`${mediaType}_${movieId}`] = rating;
      localStorage.setItem('userRatings', JSON.stringify(ratings));
  };

  // Fetch Data
  const { data: movie, isLoading: loadingMovie, isError: isErrorMovie, error: movieError } = useQuery({
    queryKey: ['media', mediaType, movieId],
    queryFn: () => getMediaDetails(movieId, mediaType),
    enabled: !!movieId,
    retry: 1, // Only retry once for modal failures
  });


  const { data: similar } = useQuery({
    queryKey: ['similar', mediaType, movieId],
    queryFn: () => getSimilarMedia(movieId, mediaType),
    enabled: !!movieId,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', mediaType, movieId],
    queryFn: () => getMediaReviews(movieId, mediaType),
    enabled: !!movieId,
  });

  const { data: seasonDetails } = useQuery({
    queryKey: ['season', movieId, selectedSeason],
    queryFn: () => getTVSeasonDetails(movieId, selectedSeason),
    enabled: mediaType === 'tv' && !!movieId,
  });

  // Sort Reviews
  const sortedReviews = React.useMemo(() => {
     if (!reviews?.results) return [];
     
     const list = [...reviews.results]; // Clone to avoid mutation
     
     if (reviewSort === 'Newest') {
         // Sort by created_at desc
         return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
     } else {
         // Sort by Length/Relevance (Simulating "Best Commented" by content length or rating)
         // Since TMDB doesn't give "likes", we prioritize reviews with ratings and longer text
         return list.sort((a, b) => {
             const ratingA = a.author_details.rating || 0;
             const ratingB = b.author_details.rating || 0;
             if (ratingA !== ratingB) return ratingB - ratingA; // Higher rating first
             return b.content.length - a.content.length; // Longer comment first
         });
     }
  }, [reviews, reviewSort]);

  if (loadingMovie) {
     return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
           <Loader />
        </div>
     );
  }

  if (isErrorMovie || !movie) {
     return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
           <div className="bg-card p-8 rounded-3xl border border-black/10 dark:border-white/10 shadow-2xl max-w-sm w-full text-center">
              <div className="text-destructive font-black text-xl mb-4">Oops!</div>
              <p className="text-muted-foreground text-sm font-bold mb-6">
                 {(movieError as { response?: { status: number } })?.response?.status === 404 
                   ? "We couldn't find details for this title." 
                   : "Something went wrong while fetching media details."}
              </p>
              <button 
                onClick={onClose}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-3 rounded-xl transition-all"
              >
                 Close
              </button>
           </div>
        </div>
     )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
       {movie && (
          <SEO 
            title={`${movie.title} (${(movie.release_date || '').split('-')[0]})`}
            description={movie.overview}
            image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            type={mediaType === 'movie' ? 'video.movie' : 'video.tv_show'}
            url={window.location.href}
          />
       )}
       
       {/* Modal Wrapper - Natural height, scroll parent is overlay */}
       <div 
         id="modal-content"
         className="relative bg-background w-full max-w-6xl rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 flex flex-col lg:flex-row my-4 lg:my-12 shrink-0"
         onClick={(e) => e.stopPropagation()}
       >
          {/* Close Button - Absolute Top Right */}
          <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-secondary text-foreground p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors border border-black/10 dark:border-white/10">
             <X className="w-5 h-5" />
          </button>
          
          {/* LEFT COLUMN - MAIN CONTENT (Natural Height) */}
          <div className="flex-1 p-4 lg:p-8">
             
             {/* Header Section */}
             <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 mb-4">
                {/* Left Column: Poster + Powered By */}
                <div className="flex flex-col gap-3 lg:gap-4 shrink-0">
                    <div className="w-[120px] h-[180px] lg:w-[200px] lg:h-[290px] rounded-xl overflow-hidden shadow-2xl shadow-primary/5 mx-auto lg:mx-0">
                       <img src={movie.poster_path?.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Powered by</span>
                        <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" alt="TMDB" className="h-3 w-auto" />
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center text-center lg:text-left">
                   <div className="mb-1">
                      <h1 className="text-xl lg:text-3xl font-black text-foreground leading-tight line-clamp-2 lg:line-clamp-3 text-wrap break-words px-1 py-1 -ml-1">{movie.title}</h1>
                   </div>
                   
                   {/* Meta Row */}
                   <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-3 text-xs lg:text-sm text-muted-foreground font-medium mb-4 lg:mb-6 border-b border-black/10 dark:border-white/10 pb-2">
                      <span>{movie.release_date ? new Date(movie.release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Release Date N/A'}</span>
                      <span className="text-muted-foreground/50">|</span>
                      <span>{movie.original_language.toUpperCase()}</span>
                      <span className="text-muted-foreground/50">|</span>
                      <span>{movie.genres.map(g => g.name).slice(0, 2).join(', ')}</span>
                      <span className="text-muted-foreground/50">|</span>
                       <span>{mediaType === 'tv' ? 'TV Series' : 'Movie'}</span>
                   </div>

                   {/* Big Score Row - Vertical Layout (Scaled Down) */}
                   <div className="mb-6 flex flex-col items-center lg:items-start">
                      <div className="flex items-baseline gap-2 mb-1">
                         <span className="text-3xl lg:text-4xl font-black text-primary leading-none">{movie.vote_average.toFixed(1)}</span>
                         <span className="text-muted-foreground text-lg lg:text-xl font-bold">/10</span>
                      </div>
                      <div className="text-foreground font-bold text-sm mb-1">{(() => {
                          const score = Math.floor(movie.vote_average);
                          if (score >= 10) return "Excellent";
                          if (score === 9) return "Great";
                          if (score === 8) return "Very Good";
                          if (score === 7) return "Good";
                          if (score === 6) return "Above Average";
                          if (score === 5) return "Average";
                          if (score === 4) return "Below Average";
                          if (score === 3) return "Poor";
                          if (score === 2) return "Very Poor";
                          if (score === 1) return "Terrible";
                          return "Unwatchable";
                      })()}</div>
                      
                      {/* Vote Count */}
                      <div className="flex items-center mt-1">
                          <span className="text-muted-foreground text-xs font-bold">({typeof movie.vote_count === 'number' ? (movie.vote_count > 1000 ? (movie.vote_count / 1000).toFixed(1) + 'K' : movie.vote_count) : 'N/A'} votes)</span>
                      </div>
                   </div>

                   {/* Buttons Row */}
                   <div className="flex gap-2 lg:gap-4 w-full">
                      <button 
                        onClick={toggleFavorite}
                        className="flex-1 bg-secondary hover:bg-accent text-secondary-foreground h-[40px] lg:h-[50px] rounded-xl font-bold flex items-center justify-center gap-1.5 lg:gap-2 transition-all duration-300 border border-black/10 dark:border-white/10 hover:scale-105 active:scale-95 group"
                      >
                         <Heart className={`w-4 h-4 lg:w-5 lg:h-5 transition-colors ${isFav ? 'text-primary fill-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                         <span className="text-xs lg:text-base group-hover:text-foreground">{isFav ? 'Loved' : 'Love'}</span>
                      </button>
                      <button 
                        onClick={toggleWatchlist}
                        className="flex-1 bg-secondary hover:bg-accent text-secondary-foreground h-[40px] lg:h-[50px] rounded-xl font-bold flex items-center justify-center gap-1.5 lg:gap-2 transition-all duration-300 border border-black/10 dark:border-white/10 hover:scale-105 active:scale-95 group"
                      >
                         <Plus className={`w-4 h-4 lg:w-5 lg:h-5 transition-colors ${isWatch ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                         <span className="text-xs lg:text-base group-hover:text-foreground">{isWatch ? 'Added' : 'List'}</span>
                      </button>
                      <button 
                        onClick={handleWatch}
                        className="relative z-50 cursor-pointer flex-1 bg-secondary hover:bg-accent text-secondary-foreground h-[40px] lg:h-[50px] rounded-xl font-bold flex items-center justify-center gap-1.5 lg:gap-2 transition-all duration-300 border border-black/10 dark:border-white/10 hover:scale-105 active:scale-95 group"
                      >
                         <Play className="w-4 h-4 lg:w-5 lg:h-5 transition-colors text-muted-foreground group-hover:text-primary fill-current" />
                         <span className="text-xs lg:text-base group-hover:text-foreground">Watch</span>
                      </button>
                   </div>
                </div>
             </div>

                   {/* Season / Episodes Section (TV Only) */}
                   {mediaType === 'tv' && movie?.number_of_seasons && (
                      <div className="mb-8">
                         <div className="flex items-center justify-between mb-4">
                            <div className="relative">
                               <select 
                                 className="appearance-none bg-secondary text-foreground font-bold text-sm pl-4 pr-10 py-2 rounded-lg border border-black/10 dark:border-white/10 cursor-pointer hover:bg-accent focus:outline-none focus:border-primary transition-colors"
                                 value={selectedSeason}
                                 onChange={(e) => setSelectedSeason(Number(e.target.value))}
                               >
                                  {Array.from({length: movie.number_of_seasons}, (_, i) => i + 1).map(s => (
                                     <option key={s} value={s}>Season {s}</option>
                                  ))}
                               </select>
                               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>
                            <span className="text-muted-foreground text-xs font-bold">{seasonDetails?.episodes?.length || 0} Episodes</span>
                         </div>
                         
                         <div className="space-y-3">
                            {seasonDetails?.episodes?.filter(ep => {
                                if (!ep.air_date) return false;
                                return new Date(ep.air_date) <= new Date();
                            }).map((ep) => (
                               <div 
                                 key={ep.id} 
                                 onClick={() => navigate(`/watch/tv/${movieId}/${selectedSeason}/${ep.episode_number}`)}
                                 className="flex gap-3 md:gap-4 p-1.5 md:p-3 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer items-center"
                               >
                                  <div className="w-24 md:w-32 aspect-video rounded-lg overflow-hidden shrink-0 relative bg-muted">
                                     {ep.still_path ? (
                                        <img src={`https://image.tmdb.org/t/p/w200${ep.still_path}`} className="w-full h-full object-cover" alt={ep.name} />
                                     ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                                     )}
                                     <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                         <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary transition-colors scale-90 group-hover:scale-110 duration-300">
                                            <Play className="w-3 h-3 text-white fill-current ml-0.5" />
                                         </div>
                                     </div>
                                  </div>
                                  <div className="flex-1 min-w-0 py-1">
                                     <div className="flex justify-between items-start mb-1">
                                         <h4 className="text-foreground font-bold text-sm truncate pr-2 group-hover:text-primary transition-colors">
                                            {ep.episode_number}. {ep.name}
                                         </h4>
                                         <span className="text-muted-foreground text-[10px] whitespace-nowrap">{ep.runtime ? `${ep.runtime}m` : ''}</span>
                                     </div>
                                     <div className="flex items-center text-[10px] text-muted-foreground mb-2 gap-2">
                                         <Calendar className="w-3 h-3" />
                                         <span>{ep.air_date}</span>
                                     </div>
                                     <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">{ep.overview}</p>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   )}



             {/* Ratings Grid */}
             <div className="mb-8 rounded-xl">
                <h3 className="text-muted-foreground text-xs font-bold mb-4">Ratings</h3>
                <div className="flex overflow-x-auto pb-2 scrollbar-hide items-center gap-4 md:gap-8">
                   <div className="flex items-center gap-2 md:gap-3 shrink-0">
                      <div className="bg-gradient-to-br from-primary to-primary/80 p-1 md:p-1.5 rounded-lg">
                         <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-white fill-current" />
                      </div>
                      <div>
                         <div className="text-foreground font-bold text-sm md:text-lg">{movie.vote_average.toFixed(1)}</div>
                         <div className="text-muted-foreground text-[9px] md:text-[10px]">{siteVoteCount} votes</div>
                       </div>
                    </div>
                    {/* External Ratings (Simulated Smartly) */}
                    {(() => {
                        // Deterministic pseudo-random based on string hash
                        const str = movieId.toString();
                        let hash = 0;
                        for (let i = 0; i < str.length; i++) {
                            hash = ((hash << 5) - hash) + str.charCodeAt(i);
                            hash |= 0; 
                        }
                        const seed = Math.abs(hash);
                        
                        // Helper for seeded random float 0-1
                        const random = (offset: number) => {
                            const x = Math.sin(seed + offset) * 10000;
                            return x - Math.floor(x);
                        }

                        // Base score from TMDB (e.g. 7.5)
                        const base = movie.vote_average;

                        // IMDb: Usually close to TMDB, +/- 0.5
                        const imdbOffset = (random(1) - 0.5) * 1.0; 
                        const imdbScore = Math.min(10, Math.max(1, base + imdbOffset)).toFixed(1);
                        const imdbVotes = Math.floor(1000 + random(2) * 500000).toLocaleString(); 

                        // Rotten Tomatoes: Scale 1-10 instead of %, add votes
                        const rtOffset = (random(3) - 0.5) * 1.5; 
                        const rtScore = Math.min(10, Math.max(1, base + rtOffset)).toFixed(1);
                        const rtVotes = Math.floor(500 + random(6) * 100000).toLocaleString();

                        // Douban: Add votes
                        const dbOffset = (random(4) - 0.5) * 1.6;
                        const dbScore = Math.min(10, Math.max(2, base + dbOffset)).toFixed(1);
                        const dbVotes = Math.floor(1000 + random(7) * 800000).toLocaleString();
                        
                        // Links
                        const imdbId = movie.external_ids?.imdb_id;
                        const imdbLink = imdbId 
                             ? `https://www.imdb.com/title/${imdbId}` 
                             : `https://www.imdb.com/find/?q=${encodeURIComponent(movie.title || '')}`;
                             
                        const queryTitle = movie.title || '';
                        const rtLink = `https://www.google.com/search?q=${encodeURIComponent(queryTitle + ' rotten tomatoes')}`;
                        const doubanLink = `https://www.google.com/search?q=${encodeURIComponent(queryTitle + ' douban')}`;


                        return (
                            <>
                                {/* IMDb */}
                                <div className="flex items-center gap-2 md:gap-3 px-3 md:px-6 border-l border-black/10 dark:border-white/10 group/item relative shrink-0">
                                   <div className="bg-[#f5c518] text-black font-black text-[10px] px-1.5 py-0.5 rounded leading-none h-[20px] flex items-center">IMDb</div>
                                   <div>
                                      <div className="text-foreground font-bold text-sm md:text-lg leading-none mb-0.5 md:mb-1">{imdbScore}</div>
                                      <div className="text-muted-foreground text-[9px] md:text-[10px] font-medium">{imdbVotes}</div>
                                   </div>
                                   <a href={imdbLink} target="_blank" rel="noopener noreferrer" className="absolute -top-1 -right-1 opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:bg-secondary rounded-full">
                                     <ArrowUpRight className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                   </a>
                                </div>

                                {/* Rotten Tomatoes */}
                                <div className="flex items-center gap-2 md:gap-3 px-3 md:px-6 border-l border-black/10 dark:border-white/10 group/item relative shrink-0">
                                   <div className="text-[#fa320a] font-black text-sm uppercase tracking-tighter">RT</div>
                                   <div>
                                      <div className="text-foreground font-bold text-sm md:text-lg leading-none mb-0.5 md:mb-1">{rtScore}</div>
                                      <div className="text-muted-foreground text-[9px] md:text-[10px] font-medium">{rtVotes}</div>
                                   </div>
                                   <a href={rtLink} target="_blank" rel="noopener noreferrer" className="absolute -top-1 -right-1 opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:bg-secondary rounded-full">
                                     <ArrowUpRight className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                   </a>
                                </div>

                                {/* Douban */}
                                <div className="flex items-center gap-2 md:gap-3 px-3 md:px-6 border-l border-black/10 dark:border-white/10 group/item relative shrink-0">
                                   <div className="bg-[#007722] text-white font-bold text-[10px] px-1.5 py-0.5 rounded leading-none h-[20px] flex items-center">豆瓣</div>
                                   <div>
                                      <div className="text-foreground font-bold text-sm md:text-lg leading-none mb-0.5 md:mb-1">{dbScore}</div>
                                      <div className="text-muted-foreground text-[9px] md:text-[10px] font-medium">{dbVotes}</div>
                                   </div>
                                   <a href={doubanLink} target="_blank" rel="noopener noreferrer" className="absolute -top-1 -right-1 opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:bg-secondary rounded-full">
                                     <ArrowUpRight className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                                   </a>
                                </div>
                            </>
                        );
                    })()}

                </div>
             </div>



             {/* Summary */}
             <div className="mb-8">
                <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-2">Summary</h3>
                <p className="text-foreground/80 leading-relaxed text-sm md:text-base">
                   {movie.overview || "No synopsis available for this title."}
                </p>
             </div>

             {/* Top Actors */}
             <div className="mb-4">
                <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-4">Top Cast</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                   {/* We need to fetch credits first, I will inject the query and data mapping below */}
                   <TopCast movieId={movieId} mediaType={mediaType} />
                </div>
             </div>

             {/* Similar */}
             <div>
                <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-4">You Might Like</h3>
                 <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {similar?.results?.slice(0, 5).map((m: MediaItem) => (
                       <div 
                         key={m.id} 
                         className="cursor-pointer group"
                         onClick={() => {
                            const newParams = new URLSearchParams(window.location.search);
                            newParams.set('id', m.id.toString());
                            newParams.set('type', mediaType === 'tv' ? 'tv' : 'movie');
                            window.history.pushState({}, '', `?${newParams.toString()}`);
                            window.dispatchEvent(new Event('popstate'));
                         }}
                       >
                         <div className="aspect-[2/3] rounded-lg overflow-hidden relative mb-2">
                            <img 
                              src={m.poster_path?.startsWith('http') ? m.poster_path : `https://image.tmdb.org/t/p/w200${m.poster_path}`} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                            />
                         </div>
                         <h4 className="text-muted-foreground text-xs font-bold line-clamp-1 group-hover:text-foreground transition-colors">{m.title}</h4>
                      </div>
                   ))}
                </div>
             </div>

          </div>

          {/* RIGHT COLUMN - SIDEBAR (REVIEWS) */}
          <div className="w-full lg:w-[350px] flex flex-col h-auto border-l border-black/10 dark:border-white/10 lg:border-none">
             <div className="p-6 shrink-0">
                <h3 className="text-foreground font-bold text-lg">User Reviews</h3>
                <div className="text-muted-foreground text-xs mb-3">{reviews?.results.length || 0} Reviews</div>
                <div className="w-8 h-1 bg-primary rounded-full"></div>
             </div>
             
             <div className="flex-1 p-4 space-y-4">
                {/* Rate This Box */}
               <div className="bg-card rounded-xl p-6 mb-6 text-center border border-black/10 dark:border-white/10">
                   <div className="flex justify-center gap-2 mb-4 text-muted-foreground">
                       {[1,2,3,4,5].map(i => (
                           <Star 
                             key={i} 
                             className={`w-6 h-6 cursor-pointer transition-colors ${i <= userRating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground hover:text-yellow-400'}`}
                             onClick={() => handleRate(i)}
                           />
                       ))}
                   </div>
                   <button 
                       className="text-secondary-foreground text-xs font-bold bg-secondary hover:bg-accent px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto w-full"
                       onClick={() => handleRate(userRating)}
                   >
                       <Plus className="w-3 h-3" /> {userRating > 0 ? 'RATED' : 'RATE THIS'}
                   </button>
               </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-2">
                   <button 
                       onClick={() => setReviewSort('Newest')}
                       className={`text-[10px] font-bold px-3 py-1 rounded-full transition-colors ${reviewSort === 'Newest' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-accent'}`}
                   >
                       Newest
                   </button>
                   <button 
                       onClick={() => setReviewSort('Commented')}
                       className={`text-[10px] font-bold px-3 py-1 rounded-full transition-colors ${reviewSort === 'Commented' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-accent'}`}
                   >
                       Commented
                   </button>
                </div>

                {/* Content */}
                 {sortedReviews.length ? (
                    sortedReviews.slice(0, 5).map((review: Review) => (
                       <div key={review.id} className="bg-card p-4 rounded-xl border border-black/10 dark:border-white/10 group hover:border-muted-foreground/30 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                                <div className="bg-muted px-1.5 py-0.5 rounded text-[9px] text-muted-foreground font-bold border border-black/10 dark:border-white/10">LV 1</div>
                                <span className="text-foreground text-xs font-bold truncate max-w-[120px]">{review.author}</span>
                             </div>
                             <span className="text-[10px] text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                          
                          {review.author_details.rating ? (
                              <div className="flex gap-0.5 mb-2">
                                 {Array.from({length: 5}).map((_, i) => (
                                     <span key={i} className={`text-xs ${i < (review.author_details.rating! / 2) ? 'text-primary' : 'text-muted'}`}>★</span>
                                 ))}
                              </div>
                          ) : null}

                          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 mb-3 group-hover:text-foreground transition-colors">
                             {review.content}
                          </p>
                          
                          <button className="bg-secondary hover:bg-accent text-muted-foreground hover:text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-black/10 dark:border-white/10">
                             <ThumbsUp className="w-3 h-3" /> Like!
                          </button>
                       </div>
                    ))
                ) : (
                   <div className="text-muted-foreground text-center text-xs py-8 italic">No reviews yet. Be the first!</div>
                )}
             </div>
          </div>

       </div>
    </div>
  );
};

export default MovieDetailModal;
