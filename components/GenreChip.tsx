import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SC } from '@/constants/SpotifyTheme';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function GenreChip({ label, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: SC.separator,
    marginRight: 8,
    backgroundColor: SC.surface,
  },
  chipSelected: {
    backgroundColor: SC.green,
    borderColor: SC.green,
  },
  label: {
    color: SC.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  labelSelected: {
    color: SC.black,
    fontWeight: '700',
  },
});
