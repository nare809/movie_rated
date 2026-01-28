import React from 'react';

interface FeaturedListCardProps {
  posters: string[];
}

const FeaturedListCard: React.FC<FeaturedListCardProps> = ({ posters }) => {
  return (
    <div className="hover:scale-[1.02] transition-transform duration-300 cursor-pointer group">
       {/* Posters Area - Clean, no background or border */}
       <div className="h-48 relative flex items-center justify-center">
          {/* Stacked Posters - 5 Cards */}
          <div className="relative w-48 h-44 flex items-center justify-center">
             
             {/* Far Left (Back) */}
             <div className="absolute left-0 top-6 w-20 h-32 z-0 transform -rotate-12 opacity-60 brightness-50 transition-all duration-300 group-hover:-translate-x-6">
                <img src={posters[0]} alt="" className="rounded-lg w-full h-full object-cover shadow-lg" />
             </div>

             {/* Far Right (Back) */}
             <div className="absolute right-0 top-6 w-20 h-32 z-0 transform rotate-12 opacity-60 brightness-50 transition-all duration-300 group-hover:translate-x-6">
                <img src={posters[4]} alt="" className="rounded-lg w-full h-full object-cover shadow-lg" />
             </div>

             {/* Middle Left */}
             <div className="absolute left-6 top-4 w-24 h-36 z-10 transform -rotate-6 opacity-80 brightness-75 transition-all duration-300 group-hover:-translate-x-3">
                <img src={posters[1]} alt="" className="rounded-lg w-full h-full object-cover shadow-lg" />
             </div>

             {/* Middle Right */}
             <div className="absolute right-6 top-4 w-24 h-36 z-10 transform rotate-6 opacity-80 brightness-75 transition-all duration-300 group-hover:translate-x-3">
                <img src={posters[3]} alt="" className="rounded-lg w-full h-full object-cover shadow-lg" />
             </div>

             <div className="absolute z-20 w-28 h-40 transform transition-transform duration-300 group-hover:scale-110 shadow-2xl">
                <img src={posters[2]} alt="" className="rounded-xl w-full h-full object-cover ring-1 ring-foreground/10" />
             </div>

          </div>
       </div>
    </div>
  );
};

export default FeaturedListCard;
