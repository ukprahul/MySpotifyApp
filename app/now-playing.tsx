import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SC } from '@/constants/SpotifyTheme';
import { usePlayer } from '@/context/PlayerContext';
import { isLiked, toggleLike } from '@/services/storage';

const { width: SCREEN_W } = Dimensions.get('window');
const ARTWORK_SIZE = SCREEN_W - 64;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function NowPlayingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentTrack, isPlaying, progress, playPause, next, previous, seekTo } = usePlayer();

  const [liked, setLiked] = useState(false);
  const artworkScale = useSharedValue(1);

  useEffect(() => {
    if (!currentTrack) return;
    isLiked(currentTrack.id).then(setLiked);
    artworkScale.value = withSpring(isPlaying ? 1 : 0.88, {
      damping: 12,
      stiffness: 80,
    });
  }, [currentTrack?.id, isPlaying]);

  const artworkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: artworkScale.value }],
  }));

  const handleLike = async () => {
    if (!currentTrack) return;
    const nowLiked = await toggleLike(currentTrack);
    setLiked(nowLiked);
  };

  const handleSeek = (e: GestureResponderEvent) => {
    if (progress.duration === 0) return;
    const x = e.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(1, x / (SCREEN_W - 64)));
    seekTo(ratio * progress.duration);
  };

  const artwork = currentTrack?.album.images[0]?.url;
  const artistStr = currentTrack?.artists.map((a) => a.name).join(', ') ?? '';
  const progressRatio = progress.duration > 0 ? progress.position / progress.duration : 0;

  if (!currentTrack) {
    return (
      <View style={[styles.root, styles.center]}>
        <Ionicons name="musical-notes-outline" size={64} color={SC.textMuted} />
        <Text style={styles.noTrackText}>Nothing is playing</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-down" size={28} color={SC.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.playingFrom}>PLAYING FROM RECOMMENDATIONS</Text>
          <Text style={styles.contextName} numberOfLines={1}>{currentTrack.album.name}</Text>
        </View>
        <TouchableOpacity hitSlop={12}>
          <Ionicons name="ellipsis-horizontal" size={24} color={SC.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        <Animated.View style={artworkStyle}>
          <Image
            source={artwork ? { uri: artwork } : require('@/assets/images/icon.png')}
            style={styles.artwork}
            contentFit="cover"
          />
        </Animated.View>
      </View>

      {/* Track info + like */}
      <View style={styles.infoRow}>
        <View style={styles.infoText}>
          <Text style={styles.trackTitle} numberOfLines={1}>{currentTrack.name}</Text>
          <Text style={styles.artistName} numberOfLines={1}>{artistStr}</Text>
        </View>
        <TouchableOpacity onPress={handleLike} hitSlop={12}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={26}
            color={liked ? SC.green : SC.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressArea}>
        <TouchableOpacity style={styles.progressTrack} onPress={handleSeek} activeOpacity={1}>
          <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
          <View style={[styles.progressThumb, { left: `${progressRatio * 100}%` }]} />
        </TouchableOpacity>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
          <Text style={styles.timeText}>
            -{formatTime(Math.max(0, progress.duration - progress.position))}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity hitSlop={12}>
          <Ionicons name="shuffle" size={22} color={SC.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={previous} hitSlop={12}>
          <Ionicons name="play-skip-back" size={36} color={SC.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playBtn} onPress={playPause} activeOpacity={0.8}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color={SC.black} />
        </TouchableOpacity>
        <TouchableOpacity onPress={next} hitSlop={12}>
          <Ionicons name="play-skip-forward" size={36} color={SC.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity hitSlop={12}>
          <Ionicons name="repeat" size={22} color={SC.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Volume row */}
      <View style={styles.bottomRow}>
        <Ionicons name="volume-low" size={18} color={SC.textSecondary} />
        <View style={styles.volumeTrack}>
          <View style={styles.volumeFill} />
        </View>
        <Ionicons name="volume-high" size={18} color={SC.textSecondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SC.black,
    paddingHorizontal: 32,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  topCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 16 },
  playingFrom: { color: SC.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  contextName: { color: SC.textPrimary, fontSize: 13, fontWeight: '600', marginTop: 2 },
  artworkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 8,
    backgroundColor: SC.elevated,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: { flex: 1, marginRight: 12 },
  trackTitle: { color: SC.textPrimary, fontSize: 22, fontWeight: '700' },
  artistName: { color: SC.textSecondary, fontSize: 15, marginTop: 4 },
  progressArea: { marginBottom: 24 },
  progressTrack: {
    height: 4,
    backgroundColor: SC.elevated,
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  progressFill: {
    height: 4,
    backgroundColor: SC.textPrimary,
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: SC.white,
    marginLeft: -6,
    top: -4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeText: { color: SC.textSecondary, fontSize: 12 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: SC.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  volumeTrack: {
    flex: 1,
    height: 4,
    backgroundColor: SC.elevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  volumeFill: {
    width: '70%',
    height: 4,
    backgroundColor: SC.textSecondary,
    borderRadius: 2,
  },
  noTrackText: { color: SC.textSecondary, fontSize: 16, marginTop: 16 },
  backBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: SC.green,
  },
  backBtnText: { color: SC.black, fontWeight: '700', fontSize: 14 },
});
