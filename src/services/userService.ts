import { db } from '../lib/firebase';
import { doc, setDoc, deleteDoc, getDoc, collection, getDocs, Timestamp, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import type { MediaItem } from '../api/tmdb';

export interface UserMediaItem extends MediaItem {
  addedAt: Timestamp;
}

const GUEST_KEYS = {
  FAVORITES: 'guest_favorites',
  WATCHLIST: 'guest_watchlist',
  CONTINUE: 'guest_continue_watching'
};

// Helper for guest operations to avoid repetition
const handleGuestList = (key: string, operation: 'add' | 'remove' | 'get' | 'check', itemOrId?: MediaItem | number): any => {
    try {
        const currentdStr = localStorage.getItem(key);
        let list: UserMediaItem[] = currentdStr ? JSON.parse(currentdStr) : [];
        
        if (operation === 'get') return list;

        if (operation === 'check') {
            return list.some(i => i.id === itemOrId);
        }

        if (operation === 'add' && itemOrId && typeof itemOrId === 'object') {
             // Avoid duplicates
             if (!list.some(i => i.id === (itemOrId as MediaItem).id)) {
                 const newItem = { ...itemOrId, addedAt: { seconds: Date.now() / 1000 } } as UserMediaItem;
                 list.push(newItem);
                 localStorage.setItem(key, JSON.stringify(list));
             }
        }

        if (operation === 'remove' && typeof itemOrId === 'number') {
             list = list.filter(i => i.id !== itemOrId);
             localStorage.setItem(key, JSON.stringify(list));
        }

    } catch (e) {
        console.error("Guest storage error", e);
        if (operation === 'get') return [];
        if (operation === 'check') return false;
    }
};

export const UserService = {
  // Favorites
  addToFavorites: async (userId: string | null | undefined, movie: MediaItem) => {
    if (!userId) return handleGuestList(GUEST_KEYS.FAVORITES, 'add', movie);


    const ref = doc(db, 'users', userId, 'favorites', movie.id.toString());
    await setDoc(ref, { 
      ...movie, 
      addedAt: Timestamp.now() 
    });
  },

  removeFromFavorites: async (userId: string | null | undefined, movieId: number) => {
    if (!userId) return handleGuestList(GUEST_KEYS.FAVORITES, 'remove', movieId);


    const ref = doc(db, 'users', userId, 'favorites', movieId.toString());
    await deleteDoc(ref);
  },

  isFavorite: async (userId: string | null | undefined, movieId: number): Promise<boolean> => {
    if (!userId) return handleGuestList(GUEST_KEYS.FAVORITES, 'check', movieId);

    const ref = doc(db, 'users', userId, 'favorites', movieId.toString());
    const snap = await getDoc(ref);
    return snap.exists();
  },

  getFavorites: async (userId: string | null | undefined): Promise<UserMediaItem[]> => {
    if (!userId) return handleGuestList(GUEST_KEYS.FAVORITES, 'get');


    const ref = collection(db, 'users', userId, 'favorites');
    const snap = await getDocs(ref);
    return snap.docs.map(d => d.data() as UserMediaItem);
  },

  subscribeToFavorites: (userId: string | null | undefined, onUpdate: (items: UserMediaItem[]) => void): Unsubscribe => {
    if (!userId) {
        onUpdate(handleGuestList(GUEST_KEYS.FAVORITES, 'get'));
        return () => {};
    }

    const ref = collection(db, 'users', userId, 'favorites');
    return onSnapshot(ref, (snap) => {
        const items = snap.docs.map(d => d.data() as UserMediaItem);
        onUpdate(items);
    }, (error) => {
        console.error("Favorites listener error:", error);
    });
  },

  // Watchlist (My List)
  addToWatchlist: async (userId: string | null | undefined, movie: MediaItem) => {
    if (!userId) return handleGuestList(GUEST_KEYS.WATCHLIST, 'add', movie);

    const ref = doc(db, 'users', userId, 'watchlist', movie.id.toString());
    await setDoc(ref, { 
      ...movie, 
      addedAt: Timestamp.now() 
    });
  },

  removeFromWatchlist: async (userId: string | null | undefined, movieId: number) => {
    if (!userId) return handleGuestList(GUEST_KEYS.WATCHLIST, 'remove', movieId);

    const ref = doc(db, 'users', userId, 'watchlist', movieId.toString());
    await deleteDoc(ref);
  },

  isWatchlisted: async (userId: string | null | undefined, movieId: number): Promise<boolean> => {
    if (!userId) return handleGuestList(GUEST_KEYS.WATCHLIST, 'check', movieId);

    const ref = doc(db, 'users', userId, 'watchlist', movieId.toString());
    const snap = await getDoc(ref);
    return snap.exists();
  },

  getWatchlist: async (userId: string | null | undefined): Promise<UserMediaItem[]> => {
    if (!userId) return handleGuestList(GUEST_KEYS.WATCHLIST, 'get');

    const ref = collection(db, 'users', userId, 'watchlist');
    const snap = await getDocs(ref);
    return snap.docs.map(d => d.data() as UserMediaItem);
  },

  subscribeToWatchlist: (userId: string | null | undefined, onUpdate: (items: UserMediaItem[]) => void): Unsubscribe => {
    if (!userId) {
        onUpdate(handleGuestList(GUEST_KEYS.WATCHLIST, 'get'));
        return () => {};
    }

    const ref = collection(db, 'users', userId, 'watchlist');
    return onSnapshot(ref, (snap) => {
        const items = snap.docs.map(d => d.data() as UserMediaItem);
        onUpdate(items);
    }, (error) => {
        console.error("Watchlist listener error:", error);
    });
  },

  // Continue Watching
  addToContinueWatching: async (userId: string | null | undefined, movie: MediaItem) => {
    if (!userId) return handleGuestList(GUEST_KEYS.CONTINUE, 'add', movie);

    const ref = doc(db, 'users', userId, 'continueWatching', movie.id.toString());
    await setDoc(ref, { 
      ...movie, 
      addedAt: Timestamp.now(),
      lastWatched: Timestamp.now()
    });
  },
  
  removeFromContinueWatching: async (userId: string | null | undefined, movieId: number) => {
    if (!userId) return handleGuestList(GUEST_KEYS.CONTINUE, 'remove', movieId);

    const ref = doc(db, 'users', userId, 'continueWatching', movieId.toString());
    await deleteDoc(ref);
  },
  
  getContinueWatching: async (userId: string | null | undefined): Promise<UserMediaItem[]> => {
    if (!userId) return handleGuestList(GUEST_KEYS.CONTINUE, 'get');

    const ref = collection(db, 'users', userId, 'continueWatching');
    const snap = await getDocs(ref);
    return snap.docs
               .map(d => d.data() as UserMediaItem)
               .sort((a, b) => b.addedAt.seconds - a.addedAt.seconds);
  }
};
