import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, 
  Server, 
  Bookmark, 
  BookmarkCheck, 
  Download, 
  Bell, 
  X, 
  Check 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getMediaDetails, type MediaItem } from '../api/tmdb';
import { STREAM_PROVIDERS, type StreamProvider } from '../constants/providers';
import { useUserLibrary } from '../hooks/useUserLibrary';
import SEO from '../components/common/SEO';

const Player = () => {
  const params = useParams();
  const type = (params.type || (params.id && !params.season ? 'movie' : 'tv')) as 'movie' | 'tv';
  const id = params.id;
  const season = params.season;
  const episode = params.episode;

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<StreamProvider>(STREAM_PROVIDERS[0]);
  const [isServerSheetOpen, setIsServerSheetOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  const { isWatchlisted, addWatchlist, removeWatchlist } = useUserLibrary();

  const { data: media } = useQuery({
    queryKey: ['media', type, id],
    queryFn: () => getMediaDetails(id!, type),
    enabled: !!id,
  });

  const mediaId = id ? parseInt(id, 10) : 0;
  const inWatchlist = isWatchlisted(mediaId);

  const handleToggleWatchlist = async () => {
    if (!media || !id) return;
    const mediaItem: MediaItem = {
      id: mediaId,
      title: media.title,
      name: (media as any).name,
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      overview: media.overview,
      release_date: media.release_date,
      first_air_date: (media as any).first_air_date,
      vote_average: media.vote_average,
      media_type: type,
      popularity: media.popularity,
    };

    if (inWatchlist) {
      await removeWatchlist(mediaId);
    } else {
      await addWatchlist(mediaItem);
    }
  };

  const currentStreamUrl = selectedProvider.getUrl(type, id || '', season, episode);

  useEffect(() => {
    setIsLoading(true);
  }, [selectedProvider, id, season, episode]);

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

  const downloadUrl = `https://moviesdl.cc/p/info.html?id=${id}&type=${type}`;

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col font-sans select-none overflow-hidden">
      {media && (
        <SEO 
          title={`Watch ${media.title || (media as any).name}`}
          description={media.overview}
          image={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
          type={type === 'movie' ? 'video.movie' : 'video.tv_show'}
          structuredData={structuredData}
        />
      )}

      {/* Fullscreen Video Player Background Container */}
      <div className="absolute inset-0 w-full h-full bg-black z-0">
        {isLoading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-gray-950/90 backdrop-blur-md">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-white text-xs md:text-sm font-semibold uppercase tracking-widest animate-pulse">
              Connecting to {selectedProvider.name}...
            </p>
          </div>
        )}
        <iframe
          src={currentStreamUrl}
          className="w-full h-full border-none"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          allow="autoplay; encrypted-media; picture-in-picture"
          title={`${media?.title || 'Media'} Player`}
        />
      </div>

      {/* Header Overlay */}
      <header className="absolute top-0 left-0 right-0 z-40 p-4 md:px-8 flex items-center justify-center bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
        {/* Center Control Toolbar (Close, Server, Watchlist, Download) */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          {/* Close Button */}
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-500 hover:from-rose-700 hover:to-pink-700 text-white shadow-xl shadow-rose-600/30 border border-white/20 transition-all duration-200 hover:scale-110 active:scale-95"
            title="Close / Go Back"
          >
            <X className="w-5 h-5 text-white transition-transform group-hover:rotate-90" />
          </button>

          {/* Server Selector Trigger */}
          <button
            onClick={() => setIsServerSheetOpen(!isServerSheetOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-500 hover:from-rose-700 hover:to-pink-700 text-white font-medium text-xs md:text-sm shadow-lg shadow-rose-600/25 border border-white/20 transition-all hover:scale-105 active:scale-95"
          >
            <Server className="w-4 h-4" />
            <span>Server: <strong className="font-bold">{selectedProvider.name}</strong></span>
          </button>

          {/* Watchlist Button */}
          <button
            onClick={handleToggleWatchlist}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-medium text-xs md:text-sm transition-all border ${
              inWatchlist 
                ? 'bg-rose-600/30 border-rose-500/50 text-rose-400 hover:bg-rose-600/40' 
                : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
            }`}
            title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
          >
            {inWatchlist ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">In Watchlist</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">Watchlist</span>
              </>
            )}
          </button>

          {/* Download Button */}
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 font-medium text-xs md:text-sm transition-all hover:scale-105 active:scale-95"
            title="Download Media"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </header>

      {/* Floating Server Warning Notice Banner */}
      {showBanner && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] px-4 py-2.5 rounded-xl text-white shadow-xl backdrop-blur-md bg-gradient-to-r from-red-600/90 via-rose-600/90 to-amber-600/90 border border-red-400/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
            <Bell className="w-4 h-4 shrink-0 animate-bounce" />
            <span>Please switch to other servers if default server doesn't work or buffers.</span>
          </div>
          <button 
            onClick={() => setShowBanner(false)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors shrink-0"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Server Sheet Popover Drawer */}
      {isServerSheetOpen && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 max-w-4xl w-[94vw] sm:w-[720px] md:w-[840px] p-4 md:p-6 rounded-2xl bg-black/95 backdrop-blur-xl border border-white/10 shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-rose-400" />
              <h3 className="font-bold text-white text-base">Select Streaming Server</h3>
            </div>
            <button 
              onClick={() => setIsServerSheetOpen(false)}
              className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[75vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {STREAM_PROVIDERS.map((provider) => {
              const isSelected = provider.id === selectedProvider.id;
              return (
                <button
                  key={provider.id}
                  onClick={() => {
                    setSelectedProvider(provider);
                    setIsServerSheetOpen(false);
                  }}
                  className={`relative flex items-center justify-between p-3 rounded-xl transition-all text-xs font-semibold border ${
                    isSelected 
                      ? 'bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/25 ring-2 ring-rose-400/50 scale-[1.02]' 
                      : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src={`https://flagsapi.com/${provider.countryCode}/flat/24.png`} 
                      alt={provider.countryCode} 
                      className="w-5 h-4 rounded-sm object-cover shadow-sm"
                    />
                    <span>{provider.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Player;
