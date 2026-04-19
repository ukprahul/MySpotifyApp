import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlaylistCard } from '@/components/PlaylistCard';
import { TrackItem } from '@/components/TrackItem';
import { SC } from '@/constants/SpotifyTheme';
import { usePlayer } from '@/context/PlayerContext';
import { searchAll, SpotifyPlaylist, SpotifyTrack } from '@/services/spotify';

const BROWSE_GENRES = [
  { id: 'pop', name: 'Pop', color: '#1DB954' },
  { id: 'hip-hop', name: 'Hip-Hop', color: '#8D67AB' },
  { id: 'rock', name: 'Rock', color: '#E8115B' },
  { id: 'electronic', name: 'Electronic', color: '#148A08' },
  { id: 'r-n-b', name: 'R&B', color: '#DC148C' },
  { id: 'indie', name: 'Indie', color: '#E91429' },
  { id: 'jazz', name: 'Jazz', color: '#0D73EC' },
  { id: 'classical', name: 'Classical', color: '#E13300' },
  { id: 'country', name: 'Country', color: '#BA5D07' },
  { id: 'latin', name: 'Latin', color: '#27856A' },
  { id: 'k-pop', name: 'K-Pop', color: '#9D5F2B' },
  { id: 'metal', name: 'Metal', color: '#503750' },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { playQueue, currentTrack } = usePlayer();

  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async () => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchAll(query.trim());
      setTracks(res.tracks);
      setPlaylists(res.playlists);
    } catch {
      setTracks([]);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setQuery('');
    setTracks([]);
    setPlaylists([]);
    setSearched(false);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={SC.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            placeholder="Artists, songs, or podcasts"
            placeholderTextColor={SC.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={doSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clear} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={SC.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        {query.length > 0 && (
          <TouchableOpacity onPress={doSearch} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Search</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={SC.green} size="large" />
        </View>
      )}

      {!searched && !loading && (
        <ScrollView contentContainerStyle={styles.browseContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.browseTitle}>Browse all</Text>
          <View style={styles.grid}>
            {BROWSE_GENRES.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[styles.genreCard, { backgroundColor: g.color }]}
                onPress={() => { setQuery(g.name); }}
                activeOpacity={0.8}
              >
                <Text style={styles.genreCardText}>{g.name}</Text>
                <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.3)" style={styles.genreIcon} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {searched && !loading && (
        <FlatList
          data={tracks}
          keyExtractor={(t) => t.id}
          ListHeaderComponent={
            playlists.length > 0 ? (
              <View>
                <Text style={styles.resultSection}>Playlists</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
                  {playlists.slice(0, 6).map((p) => (
                    <PlaylistCard
                      key={p.id}
                      title={p.name}
                      subtitle={p.owner.display_name}
                      imageUri={p.images[0]?.url}
                      size={130}
                      onPress={() => {}}
                    />
                  ))}
                </ScrollView>
                <Text style={styles.resultSection}>Songs</Text>
              </View>
            ) : <Text style={styles.resultSection}>Songs</Text>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No results for "{query}"</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <TrackItem
              track={item}
              isPlaying={currentTrack?.id === item.id}
              onPress={() => playQueue(tracks, index)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SC.black },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SC.white,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, color: SC.black, fontSize: 15, padding: 0 },
  cancelBtn: { paddingHorizontal: 4 },
  cancelText: { color: SC.textPrimary, fontSize: 14, fontWeight: '600' },
  browseContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  browseTitle: { color: SC.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genreCard: {
    width: '47.5%',
    height: 80,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  genreCardText: { color: SC.white, fontSize: 15, fontWeight: '700' },
  genreIcon: { position: 'absolute', right: 8, bottom: 8 },
  resultSection: {
    color: SC.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  cardRow: { paddingHorizontal: 16, paddingBottom: 8 },
  emptyText: { color: SC.textSecondary, fontSize: 15 },
});
