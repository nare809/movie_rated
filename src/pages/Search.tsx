import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchMulti } from '../api/tmdb';
import DiscoveryCard from '../components/movies/DiscoveryCard';
import { slugify } from '../utils/slug';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: searchResults, isLoading, isError, error } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchMulti(query),
    enabled: !!query,
  });

  console.log('Search Debug:', { query, isLoading, isError, results: searchResults, error });

  const navigate = useNavigate();

  // ...

  const handleOpenMedia = (media: any) => {
      const type = media.media_type === 'tv' ? 'tv' : 'movie';
      const slug = slugify(media.title || media.name || '');
      navigate(`/${type}/${media.id}/${slug}`);
  };

  if (!query) return <div className="min-h-screen p-10 text-center text-foreground pt-24 font-bold text-xl">Please enter a search term</div>;
  if (isLoading) return <div className="min-h-screen p-10 text-center text-foreground pt-24 font-bold text-xl">Loading...</div>;
  
  if (isError) {
      return (
          <div className="min-h-screen p-10 text-center text-foreground pt-24">
              <h2 className="text-xl font-bold text-red-500 mb-2">Something went wrong</h2>
              <p className="text-muted-foreground">We couldn't search for "{query}". Please try again later.</p>
          </div>
      );
  }

  const results = (searchResults?.results || []).filter(item => (item.media_type as string) !== 'person');

  return (
    <div className="min-h-screen bg-background text-foreground p-8 max-w-[1600px] mx-auto pt-24">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        Search Results for <span className="text-primary">"{query}"</span>
      </h1>
      
      {results.length === 0 ? (
        <div className="text-muted-foreground text-lg">No movies found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {results.map((movie) => (
            <DiscoveryCard 
              key={movie.id} 
              media={movie} 
              onClick={() => handleOpenMedia(movie)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
