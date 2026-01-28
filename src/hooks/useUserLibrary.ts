import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { UserService, type UserMediaItem } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import type { MediaItem } from '../api/tmdb';

export const useUserLibrary = () => {
  const { user } = useAuth();


  const [favorites, setFavorites] = useState<UserMediaItem[]>([]);
  const [watchlist, setWatchlist] = useState<UserMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time subscription for Favorites
  useEffect(() => {

    const unsub = UserService.subscribeToFavorites(user?.uid, (items) => {
        setFavorites(items);
        setIsLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  // Real-time subscription for Watchlist
  useEffect(() => {
    const unsub = UserService.subscribeToWatchlist(user?.uid, (items) => {
        setWatchlist(items);
    });
    return () => unsub();
  }, [user?.uid]);

  const favoritesSet = new Set(favorites.map(item => item.id));
  const watchlistSet = new Set(watchlist.map(item => item.id));

  // Mutations still use React Query for optimistic updates handling in OTHER parts of the app if needed,
  // but since we have a listener, we don't strictly need manual cache updates for THIS hook's data.
  // However, sticking to the service calls is fine. The listener will auto-update the UI.
  
  const addFavoriteMutation = useMutation({
    mutationFn: (media: MediaItem) => UserService.addToFavorites(user?.uid || null, media)
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (movieId: number) => UserService.removeFromFavorites(user?.uid || null, movieId)
  });

  const addWatchlistMutation = useMutation({
    mutationFn: (media: MediaItem) => UserService.addToWatchlist(user?.uid || null, media)
  });

  const removeWatchlistMutation = useMutation({
    mutationFn: (movieId: number) => UserService.removeFromWatchlist(user?.uid || null, movieId)
  });

  return {
    favorites,
    watchlist,
    isFavorite: (id: number) => favoritesSet.has(id),
    isWatchlisted: (id: number) => watchlistSet.has(id),
    isLoading, // Initial loading state
    addFavorite: addFavoriteMutation.mutateAsync,
    removeFavorite: removeFavoriteMutation.mutateAsync,
    addWatchlist: addWatchlistMutation.mutateAsync,
    removeWatchlist: removeWatchlistMutation.mutateAsync,
  };
};
