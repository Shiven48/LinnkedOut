import { create } from 'zustand'

type SearchResultState = {
  searchState: boolean
  toggle: () => void
  setSearching: (searchState: boolean) => void
}

export const useSearchingResultState = create<SearchResultState>((set) => ({
  searchState: true,
  toggle: () => set((state) => ({ searchState: !state.searchState })),
  setSearching: (open) => set({ searchState: open })
}))