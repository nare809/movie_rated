import { Link, Outlet, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Search as SearchIcon, X, Loader2, Sun, Moon } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchMulti, type MediaItem } from '../api/tmdb';
import { slugify } from '../utils/slug';
import Footer from './navigation/Footer';
import MovieDetailModal from './movies/MovieDetailModal';
import SignInModal from './auth/SignInModal';
import UserProfileDropdown from './auth/UserProfileDropdown';
import ProfileEditModal from './auth/ProfileEditModal';
import AlertModal from './common/AlertModal';
import FaceIcon from './common/FaceIcon';
import { useAuth } from '../context/AuthContext';
import { useUserLibrary } from '../hooks/useUserLibrary';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

const Navbar = ({ onSignInClick, onEditProfile }: { onSignInClick: () => void, onEditProfile: () => void }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  // Prefetch user library to ensure cache is hot on other pages
  useUserLibrary();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  // Debounce search query for API calls
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading } = useQuery({
     queryKey: ['search', debouncedQuery],
     queryFn: () => searchMulti(debouncedQuery),
     enabled: !!debouncedQuery && isFocused,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsFocused(false); // Close dropdown
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSelectResult = (item: MediaItem) => {
      const type = item.media_type === 'tv' ? 'tv' : 'movie';
      const slug = slugify(item.title || item.name || '');
      navigate(`/${type}/${item.id}/${slug}`);
      setIsFocused(false);
  };

  return (
    <>
      {/* Backdrop Blur Overlay */}
      {isFocused && (
         <div 
           className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300"
           onClick={() => setIsFocused(false)}
         />
      )}

      <nav className={`bg-background sticky top-0 z-50 border-b border-black/10 dark:border-white/10 h-16 flex items-center justify-between px-4 lg:px-6 shadow-md transition-all duration-300 ${isFocused ? 'z-50' : ''}`}>
          {/* Logo Section */}
          <div className={`flex items-center space-x-2 w-auto md:w-1/4 transition-opacity duration-300 ${isFocused ? 'opacity-0 w-0 overflow-hidden hidden md:flex md:w-1/4 md:opacity-100' : ''}`}>
            <Link to="/" className="flex items-baseline group">
              <div className="relative">
                 <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tighter">VidPlay</h1>
                 <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary absolute -top-1 -right-2 fill-current" />
              </div>
            </Link>
          </div>
          
          {/* Center Search Bar */}
          <div className={`flex items-center justify-center transition-all duration-500 ease-in-out ${isFocused ? 'w-full max-w-3xl' : 'flex-1 max-w-[150px] md:max-w-xl'} mx-auto relative`}>
             <form onSubmit={handleSearch} className={`relative w-full group z-50 transition-transform duration-300 ${isFocused ? 'scale-105' : ''}`}>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className={`w-full bg-secondary text-xs md:text-sm text-foreground pl-9 md:pl-12 pr-8 md:pr-10 py-2 md:py-2.5 rounded-full outline-none ring-0 focus:ring-0 transition-all duration-300 placeholder:text-muted-foreground font-medium border-2 ${isFocused ? 'border-primary bg-card shadow-[0_10px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)]' : 'border-transparent'}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                />
                <SearchIcon className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 transition-colors ${isFocused ? 'text-primary' : 'text-muted-foreground'}`} />
                
                {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => { setSearchQuery(''); setIsFocused(true); }}
                      className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                )}

                {/* Live Results Dropdown */}
                {isFocused && searchQuery.length > 2 && (
                    <div className="absolute top-full left-0 right-0 mt-4 bg-card rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                        {isLoading ? (
                            <div className="p-8 flex justify-center">
                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            </div>
                        ) : searchResults?.results?.length ? (
                            <div className="p-4">
                                <div className="flex items-baseline justify-between mb-4 px-1">
                                    <div className="text-xs font-black text-muted-foreground uppercase tracking-widest">Top Results</div>
                                    <button 
                                      onClick={() => handleSearch({ preventDefault: () => {} } as unknown as React.FormEvent)}
                                      className="text-[10px] font-bold text-primary hover:underline"
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                                    {searchResults.results.slice(0, 8).map((movie: MediaItem) => (
                                        <div 
                                          key={movie.id}
                                          onClick={() => handleSelectResult(movie)}
                                          className="flex-shrink-0 w-28 group/item cursor-pointer snap-start"
                                        >
                                            <div className="aspect-[2/3] bg-muted rounded-xl overflow-hidden mb-2 relative shadow-md group-hover/item:shadow-xl transition-all duration-300">
                                                {movie.poster_path ? (
                                                    <img 
                                                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
                                                      className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" 
                                                      alt={movie.title}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-bold">No Image</div>
                                                )}
                                                {/* Overlay */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center scale-75 group-hover/item:scale-100 transition-transform">
                                                        <SearchIcon className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                                {/* Mini Rating */}
                                                <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-black text-white flex items-center gap-0.5 ring-1 ring-white/10">
                                                    <span className="text-yellow-400 font-bold">★</span>
                                                    {movie.vote_average?.toFixed(1)}
                                                </div>
                                            </div>
                                            <h4 className="text-foreground font-bold text-[10px] line-clamp-2 leading-tight group-hover/item:text-primary transition-colors px-1">{movie.title || movie.name}</h4>
                                            <div className="text-muted-foreground text-[9px] px-1 mt-0.5 font-medium">{(movie.release_date || movie.first_air_date)?.split('-')[0]}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="text-muted-foreground text-sm font-bold opacity-50 italic">No results found for "{searchQuery}"</div>
                            </div>
                        )}
                    </div>
                )}
             </form>
          </div>
          
           {/* Right Actions - Now visible on mobile */}
           <div className={`flex items-center space-x-2 md:space-x-4 w-auto md:w-1/4 justify-end transition-opacity duration-300 ${isFocused ? 'opacity-0 hidden md:flex md:opacity-100' : ''}`}>
              {/* Conditional Auth UI */}
              {user ? (
                 <UserProfileDropdown onEditProfile={onEditProfile} />
              ) : (
                <button 
                   onClick={onSignInClick}
                   className="flex items-center space-x-2 bg-transparent md:bg-secondary hover:bg-accent rounded-full p-1 md:pr-4 transition-colors group">
                 <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#ff3366] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="scale-125 md:scale-150">
                       <FaceIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                    </div>
                 </div>
                 <span className="hidden md:inline text-xs font-bold text-secondary-foreground">Sign In</span>
              </button>
              )}

             {/* Theme Toggle Icon */}
             <button 
               onClick={toggleTheme}
               className="w-8 h-8 rounded-full bg-secondary hover:bg-accent flex items-center justify-center text-muted-foreground transition-colors"
               title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
             >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
             </button>
          </div>
      </nav>
    </>
  );
}

const Layout = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Logic to parse URL for /movie/123 or /tv/456
  // Prioritize URL path over query params for "modern" feeling
  const pathMatch = location.pathname.match(/\/(movie|tv)\/(\d+)/);
  
  let mediaId = searchParams.get('id');
  let mediaType = searchParams.get('type') as 'movie' | 'tv';

  if (pathMatch) {
      mediaType = pathMatch[1] as 'movie' | 'tv';
      mediaId = pathMatch[2];
  }
  
  // useMemo to prevent useEffect re-triggering on every render due to new object reference
  const selectedMedia = useMemo(() => {
    return (mediaId && mediaType) ? { id: mediaId, type: mediaType } : null;
  }, [mediaId, mediaType]);

  const { isSignInModalOpen, closeSignInModal, openSignInModal, isAlertModalOpen, alertMessage, closeAlertModal } = useAuth();
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  // Reset title when no media selected (Home View)
  useEffect(() => {
     if (!selectedMedia) {
         document.title = 'VidPlay - Stream Movies & TV';
     }
  }, [selectedMedia]);

  const handleCloseMedia = () => {
     if (pathMatch) {
         // If we are in deep link mode, close goes to home
         navigate('/');
     } else {
         const newParams = new URLSearchParams(searchParams);
         newParams.delete('id');
         newParams.delete('type');
         setSearchParams(newParams);
     }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="bg-background min-h-screen text-foreground font-sans flex flex-col relative transition-colors duration-300">
        <Navbar onSignInClick={openSignInModal} onEditProfile={() => setIsProfileEditOpen(true)} />
        <div className="pt-16 flex-grow">
          <Outlet />
        </div>
        <Footer />
        
        {/* Global Modal */}
        {selectedMedia && (
          <MovieDetailModal 
            movieId={selectedMedia.id} 
            mediaType={selectedMedia.type} 
            onClose={handleCloseMedia} 
          />
        )}
        
        <SignInModal 
          isOpen={isSignInModalOpen} 
          onClose={closeSignInModal} 
        />

        <AlertModal 
           isOpen={isAlertModalOpen}
           onClose={closeAlertModal}
           message={alertMessage}
        />

        <ProfileEditModal
          isOpen={isProfileEditOpen}
          onClose={() => setIsProfileEditOpen(false)}
        />
      </div>
    </ThemeProvider>
  );
};

export default Layout;
