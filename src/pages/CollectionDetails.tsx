import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCollectionDetails } from '../api/tmdb';
import { ArrowLeft, Share2 } from 'lucide-react';
import DiscoveryCard from '../components/movies/DiscoveryCard';
import Loader from '../components/common/Loader';
import { slugify } from '../utils/slug';

const CollectionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();


  const { data: collection, isLoading } = useQuery({
     queryKey: ['collection', id],
     queryFn: () => getCollectionDetails(Number(id)),
     enabled: !!id
  });

  const handleOpenMedia = (media: any) => {
      const type = media.media_type === 'tv' ? 'tv' : 'movie'; // Default to movie if undefined in collection but we can force it
      // Actually CollectionParts usually are movies.
      const finalType = type || 'movie';
      const slug = slugify(media.title || media.name || '');
      navigate(`/${finalType}/${media.id}/${slug}`);
  };

  if (isLoading) return <div className="min-h-screen pt-20"><Loader /></div>;
  if (!collection) return <div className="min-h-screen pt-20 text-center text-white">Collection not found</div>;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
       {/* Header Section */}
       <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto text-center relative">
          
          {/* Back Button */}
          {/* Back Button */}
          <div className="flex justify-start w-full mb-8">
             <button 
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-full transition-colors"
             >
                 <ArrowLeft className="w-4 h-4 text-primary" />
                 <span className="text-sm font-bold">Go Back</span>
             </button>
          </div>

          {/* User Info */}

          {/* Title and Desc */}
          <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tight">
             {collection.name}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed mb-6">
             {collection.overview || "Explore this curated collection of movies and shows."}
          </p>
          
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-8">
             Total of {collection.parts?.length || 0} films
          </div>

          {/* Share Button */}
          <div className="flex justify-center">
             <button className="flex items-center space-x-2 bg-secondary hover:bg-secondary/80 px-6 py-2.5 rounded-full transition-colors text-sm font-bold">
                 <span>Share</span>
                 <Share2 className="w-4 h-4" />
             </button>
          </div>
       </div>

       {/* Grid Section */}
       <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
               {collection.parts?.map((movie: any) => (
                   <DiscoveryCard 
                      key={movie.id}
                      media={{...movie, media_type: 'movie'}} // Collections usually imply movies
                      onClick={() => handleOpenMedia({...movie, media_type: 'movie'})}
                   />
               ))}
           </div>
       </div>
    </div>
  );
};

export default CollectionDetails;
