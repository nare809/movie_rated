import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Plus, Loader2 } from 'lucide-react';
import { useUserLibrary } from '../hooks/useUserLibrary';
import { slugify } from '../utils/slug';

interface UserListPageProps {
  mode: 'favorites' | 'watchlist';
}

const UserListPage: React.FC<UserListPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, watchlist, isLoading } = useUserLibrary();
// NO, I should update imports first.
  
  const items = mode === 'favorites' ? favorites : watchlist;
  const loading = isLoading;

  if (!user) {
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">Please Sign In</h2>
              <p className="text-muted-foreground">You need to be logged in to view your {mode === 'favorites' ? 'Favourites' : 'List'}.</p>
          </div>
      );
  }

  if (loading) {
      return (
          <div className="min-h-[60vh] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#ff1755] animate-spin" />
          </div>
      );
  }

  if (items.length === 0) {
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6 shadow-xl border border-border">
                  {mode === 'favorites' ? (
                      <Heart className="w-8 h-8 text-muted-foreground" />
                  ) : (
                      <Plus className="w-8 h-8 text-muted-foreground" />
                  )}
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                  {mode === 'favorites' ? "No Favourites Yet" : "Your List is Empty"}
              </h2>
              <p className="text-muted-foreground max-w-md text-lg leading-relaxed mb-8">
                  {mode === 'favorites' 
                     ? "You haven't added any movies to your favorites properly. Go ahead and add to favorites!"
                     : "Start building your personal watchlist by adding movies you want to watch."
                  }
              </p>

              <Link 
                to="/" 
                className="bg-[#ff1755] hover:bg-[#ff3366] text-white font-bold py-3 px-8 rounded-full transition-all hover:scale-105 shadow-lg shadow-pink-900/20"
              >
                  Discover Movies
              </Link>
          </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-foreground mb-8 border-l-4 border-[#ff1755] pl-4">
            {mode === 'favorites' ? 'My Favorites' : 'My List'}
        </h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {items.map((item) => {
                const isTv = item.media_type === 'tv' || !!item.first_air_date || !!item.name || !!(item as any).seasons;
                return (
                <div 
                  key={item.id} 
                  onClick={() => {
                     const type = isTv ? 'tv' : 'movie';
                     const slug = slugify(item.title || item.name || '');
                     navigate(`/${type}/${item.id}/${slug}`);
                  }}
                  className="group cursor-pointer"
                >
                    <div className="aspect-[2/3] rounded-xl overflow-hidden relative mb-3 bg-card shadow-lg border border-transparent group-hover:border-border transition-all">
                        {item.poster_path ? (
                            <img 
                                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                                alt={item.title || item.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold">No Image</div>
                        )}
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                             <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                 <div className="text-[#ff1755] font-bold text-lg mb-1">{item.vote_average?.toFixed(1)}</div>
                                 <div className="text-white text-xs line-clamp-2">{item.overview}</div>
                             </div>
                        </div>
                    </div>
                    <h3 className="text-foreground font-bold text-sm truncate group-hover:text-[#ff1755] transition-colors">
                        {item.title || item.name}
                    </h3>
                    <div className="text-muted-foreground text-xs font-bold mt-1">
                        {new Date(item.release_date || item.first_air_date || '').getFullYear() || 'Unknown'}
                    </div>
                </div>
            )})}
        </div>
    </div>
  );
};

export default UserListPage;
