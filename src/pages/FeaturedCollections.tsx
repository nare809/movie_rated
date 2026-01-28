import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCollectionDetails } from '../api/tmdb';
import FeaturedListCard from '../components/movies/FeaturedListCard';
import Loader from '../components/common/Loader';
import { ArrowLeft } from 'lucide-react';

const COLLECTION_IDS = [
  86311, // Avengers
  1241,  // Harry Potter
  10,    // Star Wars
  9485,  // Fast & Furious
  87359, // Mission Impossible
  645,   // James Bond
  263,   // Dark Knight
  119,   // LOTR
  121938,// Hobbit
  295,   // Pirates of Caribbean
  748,   // X-Men
  126125,// Spider-Man (Raimi)
  131635,// Hunger Games
  10194, // Toy Story
  2028,  // Shrek
  1709,  // Ice Age
  531,   // Madagascar
  86066, // Despicable Me
  77816, // Kung Fu Panda
  105951 // How to Train Your Dragon
];

const FeaturedCollections = () => {
  const navigate = useNavigate();
  const [displayCount, setDisplayCount] = useState(10); // Start with 10, load more to 20

  const { data: collections, isLoading } = useQuery({
     queryKey: ['featured_collections'],
     queryFn: async () => {
         // Fetch all at once for simplicity, or chunk them. 
         // Since it's ~20 requests, Promise.all might hit rate limits if not careful, but usually okay for client side standard usage.
         // Let's optimize by fetching only what's needed? 
         // Actually, for a smooth "Load More", fetching all upfront is easier if the list is fixed and small (20 is small).
         // But to be safe with rate limits, let's fetch in batches or just all if we trust TMDB.
         // Let's try all.
         return Promise.all(COLLECTION_IDS.map(id => getCollectionDetails(id).catch(() => null)));
     },
     staleTime: 1000 * 60 * 60 * 24 // 24 hours
  });

  const validCollections = collections?.filter(Boolean) || [];
  const visibleCollections = validCollections.slice(0, displayCount);
  const hasMore = displayCount < validCollections.length;

  const handleLoadMore = () => {
     setDisplayCount(prev => Math.min(prev + 10, validCollections.length));
  };

  if (isLoading) return <div className="min-h-screen pt-24 text-center"><Loader /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
       <div className="pt-24 px-4 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
             <button 
                onClick={() => navigate(-1)}
                className="bg-[#222] hover:bg-[#333] p-2 rounded-full transition-colors"
             >
                 <ArrowLeft className="w-5 h-5 text-[#ff1755]" />
             </button>
             <h1 className="text-3xl font-bold">Featured Collections</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
             {visibleCollections.map((col: any) => (
                <Link key={col.id} to={`/collection/${col.id}`}>
                    <FeaturedListCard 
                       posters={col.parts.slice(0, 5).map((p: any) => `https://image.tmdb.org/t/p/w300${p.poster_path}`)}
                    />
                    <div className="mt-3 text-center">
                        <h3 className="font-bold text-lg truncate px-2">{col.name}</h3>
                        <p className="text-xs text-muted-foreground">{col.parts.length} movies</p>
                    </div>
                </Link>
             ))}
          </div>

          {hasMore && (
             <div className="flex justify-center mt-12">
                 <button 
                   onClick={handleLoadMore}
                   className="flex items-center px-8 py-3 rounded-xl bg-[#222] hover:bg-[#333] transition-colors group"
                 >
                     <span className="text-sm font-bold text-white">Load more</span>
                 </button>
             </div>
          )}
       </div>
    </div>
  );
};

export default FeaturedCollections;
