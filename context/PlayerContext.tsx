import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { SpotifyTrack } from '@/services/spotify';

interface Progress {
  position: number;
  duration: number;
  buffered: number;
}

interface PlayerContextValue {
  queue: SpotifyTrack[];
  currentIndex: number;
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  isBuffering: boolean;
  progress: Progress;
  playQueue: (tracks: SpotifyTrack[], startIndex?: number) => Promise<void>;
  playPause: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [queue, setQueue] = useState<SpotifyTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState<Progress>({ position: 0, duration: 0, buffered: 0 });

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const loadAndPlay = useCallback(async (tracks: SpotifyTrack[], index: number) => {
    const track = tracks[index];
    if (!track?.preview_url) return;

    setIsBuffering(true);

    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: track.preview_url },
      { shouldPlay: true },
      (status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;
        setIsPlaying(status.isPlaying);
        setIsBuffering(status.isBuffering);
        setProgress({
          position: status.positionMillis / 1000,
          duration: (status.durationMillis ?? 0) / 1000,
          buffered: 0,
        });
        if (status.didJustFinish) {
          const next = index + 1;
          if (next < tracks.length) {
            loadAndPlay(tracks, next);
            setCurrentIndex(next);
          } else {
            setIsPlaying(false);
          }
        }
      },
    );

    soundRef.current = sound;
    setIsBuffering(false);
  }, []);

  const playQueue = useCallback(
    async (tracks: SpotifyTrack[], startIndex = 0) => {
      const playable = tracks.filter((t) => t.preview_url);
      if (playable.length === 0) return;
      setQueue(playable);
      setCurrentIndex(startIndex);
      await loadAndPlay(playable, startIndex);
    },
    [loadAndPlay],
  );

  const playPause = useCallback(async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }, []);

  const next = useCallback(async () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      setCurrentIndex(nextIndex);
      await loadAndPlay(queue, nextIndex);
    }
  }, [currentIndex, queue, loadAndPlay]);

  const previous = useCallback(async () => {
    if (progress.position > 3) {
      await soundRef.current?.setPositionAsync(0);
    } else {
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        setCurrentIndex(prevIndex);
        await loadAndPlay(queue, prevIndex);
      }
    }
  }, [currentIndex, queue, progress.position, loadAndPlay]);

  const seekTo = useCallback(async (seconds: number) => {
    await soundRef.current?.setPositionAsync(seconds * 1000);
  }, []);

  const currentTrack = queue[currentIndex] ?? null;

  return (
    <PlayerContext.Provider
      value={{
        queue,
        currentIndex,
        currentTrack,
        isPlaying,
        isBuffering,
        progress,
        playQueue,
        playPause,
        next,
        previous,
        seekTo,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
