import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrackItem } from '@/components/TrackItem';
import { SC } from '@/constants/SpotifyTheme';
import { usePlayer } from '@/context/PlayerContext';
import { SpotifyTrack } from '@/services/spotify';
import { getLikedSongs, toggleLike } from '@/services/storage';
import { useFocusEffect } from 'expo-router';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { playQueue, currentTrack } = usePlayer();
  const [liked, setLiked] = useState<SpotifyTrack[]>([]);

  const refresh = useCallback(async () => {
    const songs = await getLikedSongs();
    setLiked(songs);
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const handleUnlike = async (track: SpotifyTrack) => {
    await toggleLike(track);
    await refresh();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="add" size={28} color={SC.textPrimary} />
        </TouchableOpacity>
      </View>

      {liked.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color={SC.textMuted} />
          <Text style={styles.emptyTitle}>Songs you like will appear here</Text>
          <Text style={styles.emptySubtitle}>
            Save songs by tapping the heart icon while a track is playing.
          </Text>
        </View>
      ) : (
        <FlatList
          data={liked}
          keyExtractor={(t) => t.id}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <TouchableOpacity
                style={styles.playAllBtn}
                onPress={() => playQueue(liked, 0)}
                activeOpacity={0.7}
              >
                <Ionicons name="play-circle" size={52} color={SC.green} />
              </TouchableOpacity>
              <Text style={styles.countText}>{liked.length} songs</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <TrackItem
              track={item}
              isPlaying={currentTrack?.id === item.id}
              onPress={() => playQueue(liked, index)}
              onLongPress={() => handleUnlike(item)}
            />
          )}
          ListFooterComponent={
            <Text style={styles.footerHint}>Long-press a song to unlike it</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SC.black },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { color: SC.textPrimary, fontSize: 22, fontWeight: '700' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    color: SC.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: SC.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  playAllBtn: {},
  countText: { color: SC.textSecondary, fontSize: 14 },
  footerHint: {
    color: SC.textMuted,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
