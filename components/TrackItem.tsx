import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SC } from '@/constants/SpotifyTheme';
import { SpotifyTrack } from '@/services/spotify';

interface Props {
  track: SpotifyTrack;
  isPlaying?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  showNumber?: number;
}

export function TrackItem({ track, isPlaying, onPress, onLongPress, showNumber }: Props) {
  const artistStr = track.artists.map((a) => a.name).join(', ');
  const artwork = track.album.images[0]?.url;
  const hasPreview = !!track.preview_url;

  return (
    <TouchableOpacity
      style={[styles.row, !hasPreview && styles.rowDim]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.6}
    >
      {showNumber != null ? (
        <Text style={[styles.number, isPlaying && styles.numberActive]}>
          {isPlaying ? '♫' : showNumber}
        </Text>
      ) : (
        <Image
          source={artwork ? { uri: artwork } : require('@/assets/images/icon.png')}
          style={styles.artwork}
          contentFit="cover"
        />
      )}
      <View style={styles.info}>
        <Text style={[styles.title, isPlaying && styles.titleActive]} numberOfLines={1}>
          {track.name}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {!hasPreview ? '⚠ No preview · ' : ''}
          {artistStr}
        </Text>
      </View>
      <Ionicons name="ellipsis-horizontal" size={18} color={SC.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  rowDim: {
    opacity: 0.5,
  },
  number: {
    width: 28,
    textAlign: 'center',
    color: SC.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 12,
  },
  numberActive: {
    color: SC.green,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: SC.elevated,
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: SC.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  titleActive: {
    color: SC.green,
  },
  artist: {
    color: SC.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
});
