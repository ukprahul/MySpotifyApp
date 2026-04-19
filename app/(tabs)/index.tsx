import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GenreChip } from '@/components/GenreChip';
import { PlaylistCard } from '@/components/PlaylistCard';
import { TrackItem } from '@/components/TrackItem';
import { SC } from '@/constants/SpotifyTheme';
import { usePlayer } from '@/context/PlayerContext';
import {
  getFeaturedPlaylists,
  getNewReleases,
  getRecommendations,
  SpotifyAlbum,
  SpotifyPlaylist,
  SpotifyTrack,
} from '@/services/spotify';
import { getSavedGenreSeeds, saveGenreSeeds } from '@/services/storage';

const GENRES = [
  'pop', 'hip-hop', 'rock', 'electronic', 'r-n-b',
  'indie', 'jazz', 'classical', 'country', 'latin',
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { playQueue, currentTrack } = usePlayer();

  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
  const [recommended, setRecommended] = useState<SpotifyTrack[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['pop', 'hip-hop', 'indie']);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const seeds = await getSavedGenreSeeds();
      setSelectedGenres(seeds);
      const [pl, al, rec] = await Promise.all([
        getFeaturedPlaylists(),
        getNewReleases(),
        getRecommendations(seeds),
      ]);
      setPlaylists(pl);
      setAlbums(al);
      setRecommended(rec);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load. Add EXPO_PUBLIC_SPOTIFY_CLIENT_ID and EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET to .env.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleGenre = async (genre: string) => {
    const next = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];
    if (next.length === 0) return;
    setSelectedGenres(next);
    await saveGenreSeeds(next);
    try {
      setRecommended(await getRecommendations(next));
    } catch {}
  };

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={SC.green} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
          tintColor={SC.green}
        />
      }
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.greeting}>{greeting()}</Text>
        <Ionicons name="notifications-outline" size={24} color={SC.textPrimary} />
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color="#e74c3c" />
          <Text style={styles.errorText}> {error}</Text>
        </View>
      )}

      {/* Genre chips */}
      <Text style={styles.sectionTitle}>Browse by Genre</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {GENRES.map((g) => (
          <GenreChip key={g} label={g} selected={selectedGenres.includes(g)} onPress={() => toggleGenre(g)} />
        ))}
      </ScrollView>

      {/* AI Recommendations */}
      {recommended.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Made for You</Text>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={11} color={SC.green} />
              <Text style={styles.aiLabel}> AI Pick</Text>
            </View>
          </View>
          <FlatList
            data={recommended.slice(0, 6)}
            keyExtractor={(t) => t.id}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <TrackItem
                track={item}
                isPlaying={currentTrack?.id === item.id}
                showNumber={index + 1}
                onPress={() => playQueue(recommended, index)}
              />
            )}
          />
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => playQueue(recommended, 0)}
            activeOpacity={0.7}
          >
            <Ionicons name="play" size={14} color={SC.textPrimary} />
            <Text style={styles.outlineBtnText}> Play all recommendations</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Featured Playlists */}
      {playlists.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Featured Playlists</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {playlists.map((p) => (
              <PlaylistCard
                key={p.id}
                title={p.name}
                subtitle={p.description || `${p.tracks.total} tracks`}
                imageUri={p.images[0]?.url}
                onPress={() => router.push('/now-playing' as any)}
              />
            ))}
          </ScrollView>
        </>
      )}

      {/* New Releases */}
      {albums.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>New Releases</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {albums.map((a) => (
              <PlaylistCard
                key={a.id}
                title={a.name}
                subtitle={a.artists.map((ar) => ar.name).join(', ')}
                imageUri={a.images[0]?.url}
                onPress={() => router.push('/now-playing' as any)}
              />
            ))}
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SC.black },
  center: { flex: 1, backgroundColor: SC.black, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  greeting: { color: SC.textPrimary, fontSize: 22, fontWeight: '700' },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 4,
  },
  sectionTitle: {
    color: SC.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  row: { paddingHorizontal: 16, paddingBottom: 4 },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SC.elevated,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  aiLabel: { color: SC.green, fontSize: 11, fontWeight: '700' },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: SC.separator,
  },
  outlineBtnText: { color: SC.textPrimary, fontSize: 14, fontWeight: '600' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    backgroundColor: '#2a1515',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c',
  },
  errorText: { color: '#e74c3c', fontSize: 12, flex: 1 },
});
