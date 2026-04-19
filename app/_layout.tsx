import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import TrackPlayer from 'react-native-track-player';
import { PlayerProvider } from '@/context/PlayerContext';

TrackPlayer.registerPlaybackService(() => require('../trackPlayerService'));

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <PlayerProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="now-playing"
            options={{
              headerShown: false,
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
        <StatusBar style="light" />
      </PlayerProvider>
    </ThemeProvider>
  );
}
