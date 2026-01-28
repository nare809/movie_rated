import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { getTrendingAll, getMonthlyTrendingAll, getTotalTrendingAll, getCollectionDetails } from '../api/tmdb';
import type { MediaItem, MediaResponse } from '../api/tmdb';
import SectionHeader from '../components/common/SectionHeader';
import FeaturedListCard from '../components/movies/FeaturedListCard';
import Loader from '../components/common/Loader';
import DiscoverySection from '../components/movies/DiscoverySection';
import { fetchWithCache, CACHE_KEYS, CACHE_DURATION } from '../utils/cache';
import { useAuth } from '../context/AuthContext';
import { UserService } from '../services/userService';
import { slugify } from '../utils/slug';

const Home = () => {
  useSearchParams();
  const [activeTrend, setActiveTrend] = useState('Daily Trend');

  const navigate = useNavigate();

  const handleTabClick = (tab: string) => {
    if (tab === 'Playlist') {
      navigate('/collections');
    }
  };

  const handleOpenMedia = (media: MediaItem) => {
     const isTv = media.media_type === 'tv' || !!media.first_air_date || !!media.name || !!(media as any).seasons;
     const type = isTv ? 'tv' : 'movie';
     const slug = slugify(media.title || media.name || '');
     navigate(`/${type}/${media.id}/${slug}`);
  };
  
   const { user } = useAuth();
   const queryClient = useQueryClient();

   const { data: continueWatching } = useQuery({
      queryKey: ['continueWatching', user?.uid],
      queryFn: () => UserService.getContinueWatching(user?.uid || null),
      // enabled: always true now
      staleTime: 1000 * 60 * 1, // 1 min check
  });

   const handleRemoveContinueWatching = async (e: React.MouseEvent, movieId: number) => {
      e.stopPropagation();
      if (!user) return;
      
      try {
         await UserService.removeFromContinueWatching(user.uid, movieId);
         queryClient.invalidateQueries({ queryKey: ['continueWatching', user?.uid] });
      } catch (error) {
         console.error("Failed to remove from continue watching", error);
      }
   };

  const { data: trending, isLoading, error, isFetching } = useQuery({
    queryKey: ['trending', activeTrend],
    queryFn: () => {
       switch(activeTrend) {
          case 'Weekly Trend': 
             return fetchWithCache(CACHE_KEYS.WEEKLY_TREND, () => getTrendingAll('week'), CACHE_DURATION.WEEK);
          case 'Monthly Trend': 
             return fetchWithCache(CACHE_KEYS.MONTHLY_TREND, () => getMonthlyTrendingAll(), CACHE_DURATION.DAY);
          case 'Total Trend': 
             return fetchWithCache(CACHE_KEYS.TOTAL_TREND, () => getTotalTrendingAll(), CACHE_DURATION.DAY);
          case 'Daily Trend': 
          default: 
             return fetchWithCache(CACHE_KEYS.DAILY_TREND, () => getTrendingAll('day'), CACHE_DURATION.DAY);
       }
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // Keep in memory for 5 mins, but persistent cache handles long term
  });

  const { data: collections } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
        const ids = [86311, 1241, 9485, 87359, 10]; // Avengers, HP, F&F, MI, Star Wars
        return Promise.all(ids.map(id => getCollectionDetails(id)));
    },
    placeholderData: keepPreviousData,
  });

  if (isLoading) return <div className="min-h-screen pt-20"><Loader /></div>;
  if (error) return <div className="p-10 text-center text-destructive">Error loading movies</div>;

  const movieList = (trending as MediaResponse)?.results as MediaItem[] | undefined;

  const featuredLists = collections?.map((col) => ({
     id: col.id,
     posters: (col?.parts || []).slice(0, 5).map(p => `https://image.tmdb.org/t/p/w300${p.poster_path}`)
  })) || [];

  return (
    <div>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        

        
        {/* Continue Watching Section */}
        {continueWatching && continueWatching.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center mb-6">
               <div className="w-1.5 h-8 bg-primary rounded-full mr-3"></div>
               <h2 className="text-3xl font-bold text-foreground">Continue Watching</h2>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
               {continueWatching.map((movie) => (
                  <div 
                    key={movie.id} 
                    className="flex-shrink-0 w-[200px] group cursor-pointer relative"
                    onClick={() => {
                       handleOpenMedia(movie);
                    }}
                  >
                     <div className="aspect-[16/9] rounded-xl overflow-hidden mb-2 relative shadow-lg group-hover:shadow-black/60 transition-all border border-black/10 dark:border-white/10 group-hover:border-primary/50">
                        {movie.backdrop_path ? (
                           <img 
                              src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`} 
                              alt={movie.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                           />
                        ) : (
                           <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground font-bold">No Image</div>
                        )}
                        
                          {/* Play Overlay */}
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                             {/* Remove Button */}
                             <button 
                               onClick={(e) => handleRemoveContinueWatching(e, movie.id)}
                               className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-primary backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-30"
                               title="Remove from list"
                             >
                                <X className="w-4 h-4" />
                             </button>

                             <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                                <svg className="w-4 h-4 text-white fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                             </div>
                          </div>
                         
                         {/* Progress Bar (Fake for now, randomly 30-80%) */}
                         <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                            <div className="h-full bg-primary" style={{ width: `${30 + (movie.id % 50)}%` }}></div>
                         </div>
                     </div>
                     <h3 className="text-foreground font-bold text-sm truncate group-hover:text-primary transition-colors">{movie.title || movie.name}</h3>

                  </div>
               ))}
            </div>
          </section>
        )}

        {/* Trend Section */}
        <section className="mb-12">
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
             <div className="space-y-4">
                <div className="flex items-center">
                   <div className="w-1.5 h-8 bg-primary rounded-full mr-3"></div>
                   <h2 className="text-3xl font-bold text-foreground">Trend</h2>
                </div>
                {/* Trend Options Pills */}
                <div className="flex flex-wrap gap-2">
                   {['Daily Trend', 'Weekly Trend', 'Monthly Trend', 'Total Trend'].map(opt => (
                     <button 
                       key={opt}
                       onClick={() => setActiveTrend(opt)}
                       className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTrend === opt ? 'bg-primary text-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                     >
                       {opt}
                     </button>
                   ))}
                </div>
             </div>
             
             {/* Right Side Buttons - Hidden on mobile as requested */}
             <div className="hidden md:flex space-x-3 self-end md:self-auto">
                <button 
                  onClick={() => navigate('/search')}
                  className="flex items-center px-5 py-2.5 rounded-xl bg-secondary hover:bg-accent transition-all duration-300 group hover:scale-105 active:scale-95"
                >
                    <Search className="w-4 h-4 text-primary mr-2 transition-colors" />
                    <span className="text-sm font-bold text-foreground">Search</span>
                </button>
             </div>
          </div>

          {/* Cards Grid: 10 Columns on XL screens, showing 20 items (2 rows) */}
          <div className="relative min-h-[200px]">
             {isFetching && !isLoading && (
                <div className="absolute inset-0 z-20 flex items-start justify-center pt-20 bg-background/50 backdrop-blur-[1px] rounded-xl transition-all duration-300">
                    <Loader />
                </div>
             )}
             <div className={`grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-10 gap-3 transition-opacity duration-300 ${isFetching && !isLoading ? 'opacity-50' : 'opacity-100'}`}>
                {movieList?.slice(0, 20).map((movie: MediaItem, index: number) => (
                    <div 
                      key={movie.id} 
                      className="relative group cursor-pointer"
                     onClick={() => {
                        handleOpenMedia(movie);
                     }}
                    >
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 shadow-lg hover:shadow-xl hover:shadow-black/20 dark:hover:shadow-black/40 transition-all">
                          <img 
                              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} 
                              alt={movie.title || movie.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {/* Gradient Overlay for Text Readability */}
                          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 to-transparent"></div>
                          
                          {/* Rank Badge - Top Right */}
                       <div className="absolute top-0 right-0">
                          <div 
                            className="text-white w-6 h-6 flex items-center justify-center font-bold text-xs rounded-bl-lg shadow-lg relative z-10"
                            style={{ 
                               background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
                            }}
                          >
                            <span className="relative z-10 font-bold italic pr-0.5 text-[10px]">{index + 1}</span>
                          </div>
                       </div>
                          
                          <div className="absolute bottom-2 left-2 right-2">
                              <h3 className="text-white font-bold leading-tight text-[10px] md:text-xs drop-shadow-md line-clamp-2">{movie.title || movie.name}</h3>
                          </div>
                      </div>
                    </div>
                ))}
             </div>
          </div>
        </section>

         {/* Featured List Section - Moved after Trend as requested */}
         <section className="mb-12">
            <SectionHeader title="Collections" tabs={['Playlist']} noUnderline onTabClick={handleTabClick} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {featuredLists.map((list, i) => (
                  <Link 
                     key={i} 
                     to={`/collection/${list.id}`} 
                     className={`
                        ${i < 2 ? 'block' : 'hidden'} 
                        ${i >= 2 && i < 4 ? 'md:block' : ''} 
                        ${i >= 4 ? 'lg:block' : ''}
                     `}
                  >
                     <FeaturedListCard {...list} />
                  </Link>
                ))}
            </div>
         </section>

        {/* Discovery Section (All Videos / Filters) */}
        <DiscoverySection />

      </div>
    </div>
  );
};

export default Home;
