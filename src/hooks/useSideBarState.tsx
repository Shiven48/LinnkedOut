import { create } from 'zustand'

type SidebarState = {
  isOpen: boolean
  toggle: () => void
  setIsOpen: (open: boolean) => void
}

export const useSidebarState = create<SidebarState>((set) => ({
  isOpen: true,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsOpen: (open) => set({ isOpen: open })
}))