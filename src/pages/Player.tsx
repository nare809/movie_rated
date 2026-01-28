import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getMediaDetails } from '../api/tmdb';
import SEO from '../components/common/SEO';

const Player = () => {
    const params = useParams();
    const type = params.type || (params.id && !params.season ? 'movie' : 'tv'); // Infer if missing
    const id = params.id;
    const season = params.season;
    const episode = params.episode;
    
    // const { type, id, season, episode } = useParams<{ type: string; id: string; season?: string; episode?: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const { data: media } = useQuery({
        queryKey: ['media', type, id],
        queryFn: () => getMediaDetails(id!, type as 'movie' | 'tv'),
        enabled: !!id,
    });

    const playerUrl = type === 'movie' 
        ? `https://www.zxcstream.xyz/player/movie/${id}`
        : `https://www.zxcstream.xyz/player/tv/${id}/${season}/${episode}`;

    // Schema.org Structured Data
    const structuredData = media ? {
        "@context": "https://schema.org",
        "@type": type === 'movie' ? "Movie" : "TVSeries",
        "name": media.title || (media as any).name,
        "description": media.overview,
        "image": media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : undefined,
        "datePublished": media.release_date || (media as any).first_air_date,
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": media.vote_average,
          "bestRating": "10",
          "ratingCount": media.vote_count
        }
    } : undefined;

    return (
        <div className="group fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden">
            {media && (
                <SEO 
                    title={media.title || (media as any).name}
                    description={media.overview}
                    image={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                    type={type === 'movie' ? 'video.movie' : 'video.tv_show'}
                    structuredData={structuredData}
                />
            )}
            {/* Top Toolbar - Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors text-white"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-white font-bold text-lg leading-none">
                            {media?.title || (media as any)?.name || 'Loading...'}
                        </h1>
                        {type === 'tv' && (
                            <p className="text-gray-400 text-xs mt-1 font-bold uppercase tracking-widest">
                                Season {season} • Episode {episode}
                            </p>
                        )}
                    </div>
                </div>


            </div>

            {/* Player Container */}
            <div className="relative flex-1 bg-black w-full h-full">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black z-40">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-white font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Preparing Stream...</p>
                    </div>
                )}
                <iframe
                    src={playerUrl}
                    className="w-full h-full border-none"
                    allowFullScreen
                    onLoad={() => setIsLoading(false)}
                    allow="autoplay; encrypted-media"
                    title="Video Player"
                />
            </div>
            

        </div>
    );
};

export default Player;
