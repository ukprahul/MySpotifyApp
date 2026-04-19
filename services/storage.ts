import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpotifyTrack } from './spotify';

const LIKED_KEY = '@myspotify_liked';
const GENRE_SEEDS_KEY = '@myspotify_genre_seeds';

export async function getLikedSongs(): Promise<SpotifyTrack[]> {
  try {
    const json = await AsyncStorage.getItem(LIKED_KEY);
    return json ? (JSON.parse(json) as SpotifyTrack[]) : [];
  } catch {
    return [];
  }
}

export async function toggleLike(track: SpotifyTrack): Promise<boolean> {
  const liked = await getLikedSongs();
  const idx = liked.findIndex((t) => t.id === track.id);
  let updated: SpotifyTrack[];
  if (idx >= 0) {
    updated = liked.filter((t) => t.id !== track.id);
  } else {
    updated = [track, ...liked];
  }
  await AsyncStorage.setItem(LIKED_KEY, JSON.stringify(updated));
  return idx < 0;
}

export async function isLiked(trackId: string): Promise<boolean> {
  const liked = await getLikedSongs();
  return liked.some((t) => t.id === trackId);
}

export async function getSavedGenreSeeds(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(GENRE_SEEDS_KEY);
    return json ? (JSON.parse(json) as string[]) : ['pop', 'hip-hop', 'indie'];
  } catch {
    return ['pop', 'hip-hop', 'indie'];
  }
}

export async function saveGenreSeeds(genres: string[]): Promise<void> {
  await AsyncStorage.setItem(GENRE_SEEDS_KEY, JSON.stringify(genres));
}
