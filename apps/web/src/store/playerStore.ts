import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AvatarState } from '@skribbl/shared';

interface PlayerStore {
  savedName: string;
  savedAvatar: AvatarState;
  setSavedName: (name: string) => void;
  setSavedAvatar: (avatar: AvatarState) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set) => ({
      savedName: '',
      savedAvatar: { color: 0, eyes: 0, mouth: 0 },
      setSavedName: (name) => set({ savedName: name }),
      setSavedAvatar: (avatar) => set({ savedAvatar: avatar }),
    }),
    {
      name: 'skribbl-player',
    }
  )
);