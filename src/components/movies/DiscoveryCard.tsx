import React from 'react';
import { Heart, Plus, Check } from 'lucide-react';
import type { MediaItem } from '../../api/tmdb';
import { useAuth } from '../../context/AuthContext';
import { useUserLibrary } from '../../hooks/useUserLibrary';

interface DiscoveryCardProps {
  media: MediaItem;
  onClick?: () => void;
}

const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ media, onClick }) => {
  const { user, openAlertModal } = useAuth();
  const { isFavorite, isWatchlisted, addFavorite, removeFavorite, addWatchlist, removeWatchlist } = useUserLibrary();

  const isFav = isFavorite(media.id);
  const isWatch = isWatchlisted(media.id);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAlertModal("Please sign in to add this to your favorites!");
      return;
    }

    try {
      if (isFav) {
        await removeFavorite(media.id);
      } else {
        await addFavorite(media);
      }
    } catch (error) {
      console.error("Failed to toggle favorite", error);
    }
  };

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAlertModal("Please sign in to add this to your list!");
      return;
    }

    try {
      if (isWatch) {
        await removeWatchlist(media.id);
      } else {
        await addWatchlist(media);
      }
    } catch (error) {
      console.error("Failed to toggle watchlist", error);
    }
  };

  const title = media.title || media.name || 'Untitled';
  const dateStr = media.release_date || media.first_air_date || '';
  const dateObj = dateStr ? new Date(dateStr) : null;
  
  // Format Date: "Jan 23, 2026"
  const formattedDate = dateObj 
    ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
    : '';

  // Rating: "8.3/10"
  const rating = media.vote_average ? media.vote_average.toFixed(1) : 'NR';

  // Badge Logic: Only show 'Most Hit!' for popular items, remove 'POP!' fallback
  const isPop = media.popularity > 1000;
  const badgeText = isPop ? 'Most Hit!' : null;

  return (
    <div 
      onClick={onClick}
      className="block group relative cursor-pointer"
    >
      <div className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-black/40 transition-all duration-300">
         <div className="relative aspect-[2/3]">
            {media.poster_path ? (
               <img 
                 src={`https://image.tmdb.org/t/p/w500${media.poster_path}`} 
                 alt={title} 
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                 loading="lazy"
               />
            ) : (
               <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">No Image</div>
            )}
            
            {/* Top Left Action Pills - Always Visible (Icons), Text expands on Hover */}
            <div className="absolute top-3 left-3 flex flex-col items-start gap-2 z-20">
               {/* Favourite Button */}
               <button 
                 className={`flex items-center overflow-hidden backdrop-blur-md text-white h-8 rounded-full transition-all duration-300 shadow-lg w-8 group-hover:w-auto px-0 group-hover:px-3 ${isFav ? 'bg-[#ff1755]' : 'bg-[#1f2937]/90 hover:bg-[#ff1755]'}`}
                 onClick={handleToggleFavorite}
               >
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                     <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : 'fill-transparent'}`} />
                  </div>
                  <span className="text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-1">
                    {isFav ? 'Loved it!' : 'Love it!'}
                  </span>
               </button>
               
               {/* Add to List Button */}
               <button 
                 className={`flex items-center overflow-hidden backdrop-blur-md text-white h-8 rounded-full transition-all duration-300 shadow-lg w-8 group-hover:w-auto px-0 group-hover:px-3 ${isWatch ? 'bg-[#ff1755]' : 'bg-[#1f2937]/90 hover:bg-blue-600'}`}
                 onClick={handleToggleWatchlist}
               >
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                     {isWatch ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-1">
                    {isWatch ? 'Added to List' : 'Add to List'}
                  </span>
               </button>
            </div>

            {/* Bottom Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent"></div>

            {/* Content Content - Absolute Bottom */}
            <div className="absolute bottom-3 left-3 right-3">
               <h3 className="text-white font-bold text-lg leading-tight line-clamp-1 mb-1">{title}</h3>
               <p className="text-muted-foreground text-xs font-bold mb-2">{formattedDate}</p>
               
               <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                     <span className="text-2xl font-black text-primary">{rating}</span>
                     <span className="text-xs text-muted-foreground font-bold">/10</span>
                  </div>

                  {badgeText && (
                    <span className="text-[10px] font-bold text-white px-3 py-1 rounded-full bg-purple-600 shadow-lg">
                       {badgeText}
                    </span>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DiscoveryCard;
