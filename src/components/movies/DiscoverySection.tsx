
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { discoverMedia } from '../../api/tmdb';
import type { MediaItem } from '../../api/tmdb';
import DiscoveryCard from './DiscoveryCard';
import Loader from '../common/Loader';
import { slugify } from '../../utils/slug';

const DiscoverySection = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const location = useLocation();

  // Mappings
  const languageMap: Record<string, string> = {
    'All Language': '', 'English': 'en', 'Hindi': 'hi', 'Telugu': 'te', 'Tamil': 'ta',
    'Kannada': 'kn', 'Korean': 'ko', 'Japanese': 'ja', 'Chinese': 'zh', 'Thai': 'th',   
    'Spanish': 'es', 'French': 'fr'
  };

  const genreMap: Record<string, string> = {
    'All': '', 'Drama': '18', 'Horror': '27', 'Thriller': '53', 
    'Mystery': '9648', 'Comedy': '35', 'Crime': '80', 'Sci-Fi': '878', 'Romance': '10749', 
    'Action': '28', 'Fantasy': '14', 'Animation': '16', 'Family': '10751', 'History': '36', 'War': '10752'
  };
  
  // Reverse Map for Slug -> Genre Name (e.g. "sci-fi" -> "Sci-Fi")
  // We can just iterate keys, but a reliable lookup is good.
  const getGenreFromSlug = (slug: string): string => {
      const normalizedSlug = slug.toLowerCase();
      // Handle special cases manually or fuzzy match
      const key = Object.keys(genreMap).find(k => slugify(k) === normalizedSlug);
      return key || 'All';
  };



  // Generate partial years: 2026 (Current) -> 2020.
  // Then use Decades for the rest.
  const currentYear = new Date().getFullYear(); // 2026
  // Logic: filtered from current down to 2020
  const yearLimit = 2020;
  const yearCount = currentYear - yearLimit + 1;
  const years = Array.from({length: yearCount}, (_, i) => (currentYear - i).toString());
  
  const periodMap: Record<string, { year?: number; dateRange?: { start: string; end: string } }> = {
    'All Time': {},
    '2010-2019': { dateRange: { start: '2010-01-01', end: '2019-12-31' } },
    '2000-2009': { dateRange: { start: '2000-01-01', end: '2009-12-31' } },
    '1990-1999': { dateRange: { start: '1990-01-01', end: '1999-12-31' } },
    '1980-1989': { dateRange: { start: '1980-01-01', end: '1989-12-31' } }
  };

  // Add individual years to map
  years.forEach(y => {
    periodMap[y] = { year: parseInt(y) };
  });

  // Explicit Order for Rendering
  const periodKeys = ['All Time', ...years, '2010-2019', '2000-2009', '1990-1999', '1980-1989'];
  const sortKeys = ['Most Hits', 'Highest Rating', 'Recently Released', 'Oldest'];

  // Route Handling Logic
  // /movies -> tab=Movies
  // /tv -> tab=TV Series
  // /movies/action -> tab=Movies, genre=Action
  const isMoviesPath = location.pathname.startsWith('/movies');
  const isTvPath = location.pathname.startsWith('/tv');
  
  // Determine Initial State from URL Path first, then Query Params
  let pathTab = searchParams.get('tab') || 'All';
  if (isMoviesPath) pathTab = 'Movies';
  else if (isTvPath) pathTab = 'TV Series';

  let pathGenre = searchParams.get('genre') || 'All';
  if (params.genre) {
      pathGenre = getGenreFromSlug(params.genre);
  }

  const activeTab = pathTab;
  const activeLanguage = searchParams.get('language') || 'All Language';
  const activeGenre = pathGenre;
  const activeSort = searchParams.get('sort') || 'Most Hits';
  const activePeriod = searchParams.get('period') || 'All Time';

  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Reset items when filters change
  useEffect(() => {
      setItems([]);
      setPage(1);
      setHasMore(true);
  }, [activeTab, activeLanguage, activeGenre, activeSort, activePeriod]);

  // Helper to update filters and reset list
  const updateFilters = (updates: Partial<{ tab: string, language: string, genre: string, sort: string, period: string }>) => {
      // Logic handled by useEffect now
      
      const newTab = updates.tab !== undefined ? updates.tab : activeTab;
      const newGenre = updates.genre !== undefined ? updates.genre : activeGenre;
      
      const newParams = new URLSearchParams(searchParams);
      
      // Update Params (exclude tab/genre from query if they are in path)
      const setOrDelete = (key: string, value: string | undefined, defaultValue: string) => {
          if (value && value !== defaultValue) {
              newParams.set(key, value);
          } else if (value === defaultValue) {
              newParams.delete(key);
          }
      };

      if (updates.language !== undefined) setOrDelete('language', updates.language, 'All Language');
      if (updates.sort !== undefined) setOrDelete('sort', updates.sort, 'Most Hits');
      if (updates.period !== undefined) setOrDelete('period', updates.period, 'All Time');
      
      // Clean up tab/genre from params if we are moving to a path structure
      newParams.delete('tab');
      newParams.delete('genre');

      // Construct Path
      let basePath = '/';
      if (newTab === 'Movies') basePath = '/movies';
      else if (newTab === 'TV Series') basePath = '/tv';
      
      // Append Genre to path if not 'All' and we have a specific type
      if (newGenre !== 'All' && basePath !== '/') {
          basePath += `/${slugify(newGenre)}`;
      } else if (newGenre !== 'All') {
          // If tab is All but genre is set, strictly speaking we can't use /movies/genre.
          // Fallback to query param for 'All' tab
          newParams.set('genre', newGenre);
      }

      // Optimization: use setSearchParams if path hasn't changed to avoid full navigation overhead
      // AND to ensure smoother updates for query params.
      if (basePath === location.pathname) {
          setSearchParams(newParams);
      } else {
          navigate({
              pathname: basePath,
              search: newParams.toString()
          });
      }
  };

  // Derived Params
  const type = activeTab === 'All' ? 'all' : 
               activeTab === 'Movies' ? 'movie' : 'tv'; 
  
  const { data, isLoading, isFetching, isError, error: queryError } = useQuery({
     queryKey: ['discovery', activeTab, activeLanguage, activeGenre, activeSort, activePeriod, page],
     queryFn: () => {
        const genreId = genreMap[activeGenre];
        return discoverMedia(type, {
            language: languageMap[activeLanguage],
            genre: genreId,
            sort: activeSort,
            ...periodMap[activePeriod]
        }, page);
     }
  });

  // Append new items when data changes
  useEffect(() => {
     if (data?.results) {
         setItems(prev => {
             // If data.page is 1, it means this is a fresh fetch (filter change), so replace items.
             // This avoids race conditions with local 'page' state.
             if (data.page === 1) return data.results;
             
             // Deduplicate by ID to be safe
             const newItems = data.results.filter(n => !prev.some(p => p.id === n.id));
             return [...prev, ...newItems];
         });
         setHasMore(data.page < (data.total_pages || 1));
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Auto-load 2nd page to fill the 6-column grid
  useEffect(() => {
     if (page === 1 && items.length > 0) {
         setPage(2);
     }
  }, [items, page]);

  const handleLoadMore = () => {
      setPage(p => p + 1);
  };

  // Client-side Filter for Future Dates (Double Check)
  const filteredItems = items.filter(item => {
      // Logic: If release_date/first_air_date is in future, hide it.
      const dateStr = item.release_date || item.first_air_date;
      if (!dateStr) return true; // Keep implies valid/unknown? Or hide? Let's keep for now.
      return new Date(dateStr) <= new Date();
  });

  return (
    <section className="mb-0">
       {/* Top Tabs */}
       <div className="flex items-center space-x-6 border-b border-black/10 dark:border-white/10 mb-6">
          {['All', 'Movies', 'TV Series'].map(tab => (
              <button 
                key={tab}
                onClick={() => updateFilters({ tab })}
                className={`text-lg font-bold pb-2 px-1 transition-colors ${activeTab === tab ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {tab}
              </button>
          ))}
       </div>

       {/* Filters */}
       <div className="space-y-4 mb-8">
          {/* Language */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar mask-gradient-right">
             <span className="text-muted-foreground font-bold text-sm min-w-[70px] shrink-0">Language</span>
             {Object.keys(languageMap).map(l => (
                <button 
                  key={l} 
                  onClick={() => updateFilters({ language: l })}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${activeLanguage === l ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                >
                  {l}
                </button>
             ))}
          </div>

          {/* Genres */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar mask-gradient-right">
             <span className="text-muted-foreground font-bold text-sm min-w-[60px] shrink-0">Genres</span>
             {Object.keys(genreMap).map(g => (
                <button 
                  key={g} 
                  onClick={() => updateFilters({ genre: g })}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${activeGenre === g ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                >
                  {g}
                </button>
             ))}
          </div>
          
           {/* Sort */}
           <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar mask-gradient-right">
             <span className="text-muted-foreground font-bold text-sm min-w-[60px] shrink-0">Sort</span>
             {sortKeys.map(s => (
                <button 
                  key={s} 
                  onClick={() => updateFilters({ sort: s })}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${activeSort === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                >
                  {s}
                </button>
             ))}
          </div>

          {/* Period */}
           <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar mask-gradient-right">
             <span className="text-muted-foreground font-bold text-sm min-w-[60px] shrink-0">Period</span>
             {periodKeys.map(p => (
                <button 
                  key={p} 
                  onClick={() => updateFilters({ period: p })}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${activePeriod === p ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent'}`}
                >
                  {p}
                </button>
             ))}
          </div>
       </div>

       {/* Grid */}
       <div className="relative min-h-[300px]">
           
           {items.length === 0 && isLoading ? (
              <Loader />
           ) : isError ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                 <div className="text-destructive font-bold text-lg mb-2">Error Loading Data</div>
                 <div className="text-muted-foreground text-sm">{(queryError as Error)?.message || 'Something went wrong while fetching data.'}</div>
                 <button 
                   onClick={() => updateFilters({})} 
                   className="mt-4 px-6 py-2 bg-secondary hover:bg-accent rounded-xl text-sm font-bold transition-colors"
                 >
                    Try Again
                 </button>
              </div>
           ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                 <div className="text-foreground font-bold text-lg mb-2">No Results Found</div>
                 <div className="text-muted-foreground text-sm">Try adjusting your filters to find what you're looking for.</div>
              </div>
           ) : (
              <>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                     {filteredItems.map((item) => (
                        <DiscoveryCard 
                          key={`${item.media_type}-${item.id}`} 
                          media={item} 
                          onClick={() => {
                            const isTv = item.media_type === 'tv' || !!item.first_air_date || !!item.name;
                            const type = isTv ? 'tv' : 'movie';
                            const slug = slugify(item.title || item.name || '');
                            navigate({
                              pathname: `/${type}/${item.id}/${slug}`,
                              search: searchParams.toString()
                            });
                          }}/>
                     ))}
                 </div>

                 {/* Load More Button */}
                 {hasMore && filteredItems.length > 0 && (
                     <div className="flex justify-center mt-12">
                         <button 
                           onClick={handleLoadMore}
                           disabled={isFetching}
                           className="flex items-center px-6 py-3 rounded-xl bg-secondary hover:bg-accent transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                             {isFetching ? <Loader /> : (
                                 <span className="text-sm font-bold text-foreground">Load more</span>
                             )}
                         </button>
                     </div>
                 )}
              </>
           )}
       </div>
    </section>
  );
};

export default DiscoverySection;
