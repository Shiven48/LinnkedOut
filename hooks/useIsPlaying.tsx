import { create } from 'zustand'

type PlayingState = {
  isPlaying: boolean
  toggle: () => void
  setIsPlaying: (playing: boolean) => void
}

export const usePlayingState = create<PlayingState>((set) => ({
  isPlaying: false,
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setIsPlaying: (playing) => set({ isPlaying: playing })
}))