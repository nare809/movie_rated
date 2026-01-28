import React from 'react';

const categories = [
  'All', 'Movies', 'TV Shows', 'Anime', 'Hong Kong', 'India', 'Thailand',
  'Action', 'Sci-Fi', 'Romance', 'Horror', 'Thriller', 'Mystery', 'Comedy', 'Music'
];

interface FilterBarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ activeCategory, onSelectCategory }) => {
  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex space-x-3 px-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`
              whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${activeCategory === category 
                ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                : 'bg-dark-800 text-gray-400 hover:bg-dark-700 hover:text-white border border-dark-700'}
            `}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
