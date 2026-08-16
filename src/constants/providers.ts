export interface StreamProvider {
  id: string;
  name: string;
  countryCode: string;
  getUrl: (type: 'movie' | 'tv', id: string, season?: string, episode?: string) => string;
}

export const STREAM_PROVIDERS: StreamProvider[] = [
  {
    id: 'max',
    name: 'Max',
    countryCode: 'US',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://ythd.org/embed/${id}`
        : `https://ythd.org/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'mplay',
    name: 'Mplay',
    countryCode: 'IN',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://rozgarlelo.modiplay.xyz/embed/tmdb/movie?id=${id}`
        : `https://rozgarlelo.modiplay.xyz/embed/tmdb/tv?id=${id}&season=${season}&episode=${episode}`,
  },
  {
    id: 'flicky',
    name: 'Flicky',
    countryCode: 'IN',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://flicky.host/embed/movie/${id}`
        : `https://flicky.host/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'peachify',
    name: 'Peachify',
    countryCode: 'US',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://peachify.net/embed/movie/${id}`
        : `https://peachify.net/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'rive',
    name: 'Rive',
    countryCode: 'GB',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://rive.stream/embed/movie/${id}`
        : `https://rive.stream/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'v2',
    name: 'V2',
    countryCode: 'GB',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://v2.vidsrc.vip/embed/movie/${id}`
        : `https://v2.vidsrc.vip/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'v4k',
    name: '4K',
    countryCode: 'GB',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://4k.vidsrc.vip/embed/movie/${id}`
        : `https://4k.vidsrc.vip/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'cinemaos',
    name: 'Cinemaos',
    countryCode: 'US',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://cinemaos.work/embed/movie/${id}`
        : `https://cinemaos.work/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'vixsrc',
    name: 'Vixsrc',
    countryCode: 'US',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://vixsrc.to/embed/movie/${id}`
        : `https://vixsrc.to/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'vidplus',
    name: 'Vidplus',
    countryCode: 'GB',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://player.vidplus.pro/embed/movie/${id}`
        : `https://player.vidplus.pro/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'vidplus2',
    name: 'Vidplus 2',
    countryCode: 'GB',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://player2.vidplus.pro/embed/movie/${id}`
        : `https://player2.vidplus.pro/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'videasy',
    name: 'Videasy',
    countryCode: 'US',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://player.videasy.to/movie/${id}`
        : `https://player.videasy.to/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'vidfast',
    name: 'Vidfast',
    countryCode: 'GB',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://vidfast.vc/embed/movie/${id}`
        : `https://vidfast.vc/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'nxsha',
    name: 'Nxsha',
    countryCode: 'US',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://nxsha.space/embed/movie/${id}`
        : `https://nxsha.space/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'vidsuper',
    name: 'Vidsuper',
    countryCode: 'GB',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://vidsuper.net/embed/movie/${id}`
        : `https://vidsuper.net/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'vidcore',
    name: 'Vidcore',
    countryCode: 'GB',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://vidcore.net/embed/movie/${id}`
        : `https://vidcore.net/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'vidrock',
    name: 'Vidrock',
    countryCode: 'GB',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://vidrock.net/embed/movie/${id}`
        : `https://vidrock.net/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'primesrc',
    name: 'Primesrc',
    countryCode: 'AU',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://primesrc.me/embed/movie/${id}`
        : `https://primesrc.me/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'embed2_stream',
    name: '2Embed',
    countryCode: 'AU',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://2embed.stream/embed/movie/${id}`
        : `https://2embed.stream/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'embed2_cc',
    name: '2Embed CC',
    countryCode: 'AU',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
  },
  {
    id: 'vidify',
    name: 'Vidify',
    countryCode: 'US',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://player.vidify.top/embed/movie/${id}`
        : `https://player.vidify.top/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'vidsrc',
    name: 'VidSrc',
    countryCode: 'US',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'vidsrc_pro',
    name: 'VidSrc Pro',
    countryCode: 'GB',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://vidsrc.pro/embed/movie/${id}`
        : `https://vidsrc.pro/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'autoembed',
    name: 'Autoembed',
    countryCode: 'US',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://player.autoembed.cc/embed/movie/${id}`
        : `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: 'vidsrc_me',
    name: 'VidSrc Me',
    countryCode: 'US',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://vidsrc.me/embed/movie?tmdb=${id}`
        : `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
  },
  {
    id: 'vidbinge',
    name: 'VidBinge',
    countryCode: 'GB',
    getUrl: (type, id, season = '1', episode = '1') =>
      type === 'movie'
        ? `https://vidbinge.dev/embed/movie/${id}`
        : `https://vidbinge.dev/embed/tv/${id}/${season}/${episode}`,
  },
];
