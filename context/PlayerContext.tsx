import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import { SpotifyTrack } from '@/services/spotify';

interface PlayerState {
  queue: SpotifyTrack[];
  currentIndex: number;
  isSetup: boolean;
  isBuffering: boolean;
}

interface PlayerContextValue extends PlayerState {
  currentTrack: SpotifyTrack | null;
  playbackState: State;
  progress: { position: number; duration: number; buffered: number };
  playQueue: (tracks: SpotifyTrack[], startIndex?: number) => Promise<void>;
  playPause: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

async function setupPlayer() {
  try {
    await TrackPlayer.setupPlayer({ maxCacheSize: 1024 * 5 });
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
    });
    await TrackPlayer.setRepeatMode(RepeatMode.Off);
    return true;
  } catch {
    return false;
  }
}

function toTPTrack(t: SpotifyTrack) {
  return {
    id: t.id,
    url: t.preview_url ?? '',
    title: t.name,
    artist: t.artists.map((a) => a.name).join(', '),
    artwork: t.album.images[0]?.url,
    duration: t.duration_ms / 1000,
  };
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    queue: [],
    currentIndex: 0,
    isSetup: false,
    isBuffering: false,
  });

  const playbackState = usePlaybackState();
  const progress = useProgress(500);
  const setupRef = useRef(false);

  useEffect(() => {
    if (setupRef.current) return;
    setupRef.current = true;
    setupPlayer().then((ok) => {
      setState((s) => ({ ...s, isSetup: ok }));
    });
  }, []);

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], async (event) => {
    if (event.index != null) {
      setState((s) => ({ ...s, currentIndex: event.index! }));
    }
  });

  useTrackPlayerEvents([Event.PlaybackState], (event) => {
    setState((s) => ({
      ...s,
      isBuffering: event.state === State.Buffering || event.state === State.Loading,
    }));
  });

  const playQueue = useCallback(
    async (tracks: SpotifyTrack[], startIndex = 0) => {
      if (!state.isSetup) return;
      const playable = tracks.filter((t) => t.preview_url);
      if (playable.length === 0) return;
      await TrackPlayer.reset();
      await TrackPlayer.add(playable.map(toTPTrack));
      await TrackPlayer.skip(Math.min(startIndex, playable.length - 1));
      await TrackPlayer.play();
      setState((s) => ({ ...s, queue: playable, currentIndex: startIndex }));
    },
    [state.isSetup],
  );

  const playPause = useCallback(async () => {
    const s = await TrackPlayer.getState();
    if (s === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }, []);

  const next = useCallback(async () => {
    await TrackPlayer.skipToNext();
  }, []);

  const previous = useCallback(async () => {
    if (progress.position > 3) {
      await TrackPlayer.seekTo(0);
    } else {
      await TrackPlayer.skipToPrevious();
    }
  }, [progress.position]);

  const seekTo = useCallback(async (seconds: number) => {
    await TrackPlayer.seekTo(seconds);
  }, []);

  const currentTrack = state.queue[state.currentIndex] ?? null;

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        currentTrack,
        playbackState: playbackState.state ?? State.None,
        progress: {
          position: progress.position,
          duration: progress.duration,
          buffered: progress.buffered,
        },
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
