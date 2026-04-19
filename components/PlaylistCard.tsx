import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SC } from '@/constants/SpotifyTheme';

interface Props {
  title: string;
  subtitle?: string;
  imageUri?: string;
  size?: number;
  onPress: () => void;
}

export function PlaylistCard({ title, subtitle, imageUri, size = 150, onPress }: Props) {
  return (
    <TouchableOpacity style={[styles.card, { width: size }]} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={imageUri ? { uri: imageUri } : require('@/assets/images/icon.png')}
        style={[styles.image, { width: size, height: size }]}
        contentFit="cover"
      />
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginRight: 12,
  },
  image: {
    borderRadius: 4,
    backgroundColor: SC.elevated,
  },
  title: {
    color: SC.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  subtitle: {
    color: SC.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
