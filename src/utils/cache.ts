export const CACHE_KEYS = {
  DAILY_TREND: 'cache_daily_trend',
  WEEKLY_TREND: 'cache_weekly_trend',
  MONTHLY_TREND: 'cache_monthly_trend',
  TOTAL_TREND: 'cache_total_trend',
};

export const CACHE_DURATION = {
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
};

export const fetchWithCache = async <T>(
  key: string, 
  fetcher: () => Promise<T>, 
  duration: number
): Promise<T> => {
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      const age = Date.now() - parsed.timestamp;
      if (age < duration) {

        return parsed.data as T;
      }
    } catch (e) {
      console.warn('Failed to parse cache', e);
      localStorage.removeItem(key);
    }
  }


  const data = await fetcher();
  localStorage.setItem(key, JSON.stringify({
    timestamp: Date.now(),
    data
  }));
  return data;
};
