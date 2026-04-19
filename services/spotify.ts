import axios from 'axios';

// iTunes Search API — no credentials required
const SEARCH_URL = 'https://itunes.apple.com/search';
const RSS_URL = 'https://itunes.apple.com/us/rss';

// ─── Types (same shape as before so no other files need changes) ─────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapTrack(item: any): SpotifyTrack {
  const artwork = (item.artworkUrl100 ?? '').replace('100x100bb', '600x600bb');
  return {
    id: String(item.trackId ?? Math.random()),
    name: item.trackName ?? 'Unknown',
    preview_url: item.previewUrl ?? null,
    duration_ms: item.trackTimeMillis ?? 0,
    artists: [{ id: String(item.artistId ?? ''), name: item.artistName ?? 'Unknown' }],
    album: {
      id: String(item.collectionId ?? ''),
      name: item.collectionName ?? '',
      images: [{ url: artwork }],
    },
    uri: item.trackViewUrl ?? '',
  };
}

const GENRE_PLAYLISTS = [
  { id: 'pop',        name: 'Pop Top Hits',          term: 'pop hits',        image: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/3c/a7/a7/3ca7a756-f3a8-a2d0-e9d4-0e4b59c0a0c4/source/600x600bb.jpg' },
  { id: 'hip-hop',   name: 'Hip-Hop Hits',           term: 'hip hop rap',     image: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a9/e5/a9/a9e5a96f-3c88-e4a5-a4c7-f86b5c3ec073/source/600x600bb.jpg' },
  { id: 'rock',      name: 'Rock Anthems',            term: 'rock anthems',    image: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e6/80/50/e68050c4-9c43-a4b0-e0bb-3a7b0d0e9c28/source/600x600bb.jpg' },
  { id: 'electronic',name: 'Electronic Beats',        term: 'electronic edm',  image: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/68/ab/f1/68abf104-1ee5-b6f1-08a4-3d2e2acef8c0/source/600x600bb.jpg' },
  { id: 'r-n-b',    name: 'R&B Vibes',               term: 'rnb soul',        image: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/d5/4e/d5/d54ed58b-8f7d-9571-bcdc-1ef68e50c21e/source/600x600bb.jpg' },
  { id: 'indie',     name: 'Indie Picks',             term: 'indie alternative',image: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/7e/33/6c/7e336c5e-6f60-ce58-e28e-09f52e5c51b3/source/600x600bb.jpg' },
  { id: 'jazz',      name: 'Jazz Classics',           term: 'jazz classics',   image: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/9b/44/c2/9b44c2ff-e6dc-f7cb-8e41-2cd0c87b0e3b/source/600x600bb.jpg' },
  { id: 'country',   name: 'Country Roads',           term: 'country music',   image: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/a7/89/d0/a789d08f-5484-ee1f-2de2-5e18a18a2d06/source/600x600bb.jpg' },
];

// ─── API calls ───────────────────────────────────────────────────────────────

export async function getFeaturedPlaylists(): Promise<SpotifyPlaylist[]> {
  return GENRE_PLAYLISTS.map((g) => ({
    id: g.id,
    name: g.name,
    description: `Top ${g.name} tracks on iTunes`,
    images: [{ url: g.image }],
    tracks: { total: 20 },
    owner: { display_name: 'iTunes Charts' },
  }));
}

export async function getNewReleases(): Promise<SpotifyAlbum[]> {
  const { data } = await axios.get(`${RSS_URL}/newreleases/limit=20/json`);
  const entries: any[] = data?.feed?.entry ?? [];
  return entries.map((e) => ({
    id: e.id?.attributes?.['im:id'] ?? String(Math.random()),
    name: e['im:name']?.label ?? 'Unknown',
    images: [{ url: e['im:image']?.[2]?.label ?? '' }],
    artists: [{ id: '', name: e['im:artist']?.label ?? 'Unknown' }],
    release_date: e['im:releaseDate']?.label ?? '',
    total_tracks: 10,
  }));
}

export async function getCategories(): Promise<SpotifyCategory[]> {
  return GENRE_PLAYLISTS.map((g) => ({ id: g.id, name: g.name, icons: [] }));
}

export async function searchAll(query: string) {
  const { data } = await axios.get(SEARCH_URL, {
    params: { term: query, media: 'music', limit: 20, country: 'US' },
  });
  const results: any[] = data.results ?? [];
  return {
    tracks: results.filter((r) => r.wrapperType === 'track').map(mapTrack),
    playlists: [] as SpotifyPlaylist[],
  };
}

export async function getRecommendations(
  seedGenres: string[],
  _seedTracks: string[] = [],
): Promise<SpotifyTrack[]> {
  const genre = GENRE_PLAYLISTS.find((g) => seedGenres.includes(g.id));
  const term = genre?.term ?? seedGenres[0] ?? 'pop';
  const { data } = await axios.get(SEARCH_URL, {
    params: { term, media: 'music', entity: 'song', limit: 20, country: 'US' },
  });
  return (data.results ?? []).filter((r: any) => r.wrapperType === 'track').map(mapTrack);
}

export async function getPlaylistTracks(genreId: string): Promise<SpotifyTrack[]> {
  const genre = GENRE_PLAYLISTS.find((g) => g.id === genreId);
  const term = genre?.term ?? genreId;
  const { data } = await axios.get(SEARCH_URL, {
    params: { term, media: 'music', entity: 'song', limit: 20, country: 'US' },
  });
  return (data.results ?? []).filter((r: any) => r.wrapperType === 'track').map(mapTrack);
}

export async function getAlbumTracks(albumId: string): Promise<SpotifyTrack[]> {
  const { data } = await axios.get(SEARCH_URL, {
    params: { id: albumId, media: 'music', entity: 'song', limit: 20 },
  });
  return (data.results ?? []).filter((r: any) => r.wrapperType === 'track').map(mapTrack);
}

export async function getCategoryPlaylists(_categoryId: string): Promise<SpotifyPlaylist[]> {
  return getFeaturedPlaylists();
}
