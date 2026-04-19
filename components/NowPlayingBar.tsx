import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SC } from '@/constants/SpotifyTheme';
import { usePlayer } from '@/context/PlayerContext';

export function NowPlayingBar() {
  const { currentTrack, isPlaying, playPause, next, progress } = usePlayer();
  const router = useRouter();

  if (!currentTrack) return null;

  const progressPct = progress.duration > 0 ? (progress.position / progress.duration) * 100 : 0;
  const artwork = currentTrack.album.images[0]?.url;
  const artistStr = currentTrack.artists.map((a) => a.name).join(', ');

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={() => router.push('/now-playing' as any)}
    >
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
      </View>
      <View style={styles.inner}>
        <Image
          source={artwork ? { uri: artwork } : require('@/assets/images/icon.png')}
          style={styles.artwork}
          contentFit="cover"
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.name}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {artistStr}
          </Text>
        </View>
        <TouchableOpacity onPress={playPause} hitSlop={12} style={styles.iconBtn}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={26}
            color={SC.textPrimary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={next}
          hitSlop={12}
          style={styles.iconBtn}
        >
          <Ionicons name="play-skip-forward" size={22} color={SC.textPrimary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: SC.elevated,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 4,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
  },
  progressTrack: {
    height: 2,
    backgroundColor: SC.separator,
  },
  progressFill: {
    height: 2,
    backgroundColor: SC.green,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: SC.surface,
    marginRight: 10,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: SC.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: SC.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  iconBtn: {
    marginLeft: 8,
  },
});
