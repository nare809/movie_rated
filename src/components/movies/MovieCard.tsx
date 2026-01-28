import React from 'react';
import { Link } from 'react-router-dom';
import type { MediaItem } from '../../api/tmdb';
import { slugify } from '../../utils/slug';

interface MovieCardProps {
  movie: MediaItem;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  // Awwrated Style: Red/Pink for high ratings, distinct typography
  const score = movie.vote_average.toFixed(1);
  const title = movie.title || movie.name || 'Untitled';
  const slug = slugify(title);
  const linkPath = `/${movie.media_type || 'movie'}/${movie.id}/${slug}`;
  const date = movie.release_date || movie.first_air_date || '';
  const year = date ? new Date(date).getFullYear() : '';

  return (
    <Link to={linkPath} className="block group relative">
      <div className="bg-dark-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/40">
        <div className="relative aspect-[2/3]">
          {movie.poster_path ? (
            <img 
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
              alt={title} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
             <div className="w-full h-full bg-dark-700 flex items-center justify-center text-gray-500">No Image</div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-transparent to-transparent opacity-80" />

          {/* Top Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
             {year && (
               <span className="bg-gray-800/80 backdrop-blur-md text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/10">
                 {year}
               </span>
             )}
          </div>
        </div>

        <div className="p-3 bg-dark-800 relative">
          {/* Rating Badge Floating Halfway */}
          <div className="absolute -top-6 left-3">
             <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-primary drop-shadow-md">{score}</span>
                <span className="text-xs text-gray-500 font-bold">/10</span>
             </div>
             <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mt-[-2px]">Score</div>
          </div>

          <div className="mt-4">
             <h3 className="text-white font-bold text-md leading-tight line-clamp-2 min-h-[2.5em] group-hover:text-primary transition-colors">
               {title}
             </h3>
             <div className="flex items-center justify-between mt-2">
               <span className="text-[10px] font-bold text-white bg-blue-600/80 px-2 py-0.5 rounded-full">Review</span>
               <Link to={linkPath} className="text-[10px] text-gray-400 hover:text-white transition-colors">Read full &gt;</Link>
             </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
