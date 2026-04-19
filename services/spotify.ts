import axios from 'axios';

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET ?? '';

const BASE_URL = 'https://api.spotify.com/v1';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';

let _token: string | null = null;
let _tokenExpiry = 0;

async function getToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token;

  const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
  const { data } = await axios.post(
    TOKEN_URL,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  _token = data.access_token as string;
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return _token;
}

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SpotifyTrack {
  id: string;
  name: string;
  preview_url: string | null;
  duration_ms: number;
  artists: { id: string; name: string }[];
  album: { id: string; name: string; images: { url: string }[] };
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: { total: number };
  owner: { display_name: string };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: { url: string }[];
  artists: { id: string; name: string }[];
  release_date: string;
  total_tracks: number;
}

export interface SpotifyCategory {
  id: string;
  name: string;
  icons: { url: string }[];
}

// ─── API calls ───────────────────────────────────────────────────────────────

export async function getFeaturedPlaylists(): Promise<SpotifyPlaylist[]> {
  const { data } = await api.get('/browse/featured-playlists', {
    params: { limit: 10, country: 'US' },
  });
  return data.playlists.items;
}

export async function getNewReleases(): Promise<SpotifyAlbum[]> {
  const { data } = await api.get('/browse/new-releases', {
    params: { limit: 10, country: 'US' },
  });
  return data.albums.items;
}

export async function getCategories(): Promise<SpotifyCategory[]> {
  const { data } = await api.get('/browse/categories', {
    params: { limit: 20, country: 'US' },
  });
  return data.categories.items;
}

export async function searchAll(query: string) {
  const { data } = await api.get('/search', {
    params: { q: query, type: 'track,artist,playlist', limit: 20 },
  });
  return {
    tracks: (data.tracks?.items ?? []) as SpotifyTrack[],
    playlists: (data.playlists?.items ?? []) as SpotifyPlaylist[],
  };
}

export async function getRecommendations(
  seedGenres: string[],
  seedTracks: string[] = [],
): Promise<SpotifyTrack[]> {
  const params: Record<string, string> = {
    limit: '20',
    seed_genres: seedGenres.slice(0, 5 - Math.min(seedTracks.length, 2)).join(','),
  };
  if (seedTracks.length > 0) {
    params.seed_tracks = seedTracks.slice(0, 2).join(',');
  }
  const { data } = await api.get('/recommendations', { params });
  return data.tracks as SpotifyTrack[];
}

export async function getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
  const { data } = await api.get(`/playlists/${playlistId}/tracks`, {
    params: { limit: 20, fields: 'items(track(id,name,preview_url,duration_ms,artists,album,uri))' },
  });
  return data.items
    .map((item: { track: SpotifyTrack }) => item.track)
    .filter(Boolean) as SpotifyTrack[];
}

export async function getAlbumTracks(albumId: string): Promise<SpotifyTrack[]> {
  const [albumRes, tracksRes] = await Promise.all([
    api.get(`/albums/${albumId}`),
    api.get(`/albums/${albumId}/tracks`, { params: { limit: 20 } }),
  ]);
  const album = albumRes.data;
  return tracksRes.data.items.map((t: SpotifyTrack & { track_number: number }) => ({
    ...t,
    album: { id: album.id, name: album.name, images: album.images },
  }));
}

export async function getCategoryPlaylists(categoryId: string): Promise<SpotifyPlaylist[]> {
  const { data } = await api.get(`/browse/categories/${categoryId}/playlists`, {
    params: { limit: 10 },
  });
  return data.playlists.items;
}
