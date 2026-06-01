import { create } from "zustand";

type LoadingState = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

export const useLoadingStore = create<LoadingState>()((set) => ({
  isLoading: false,
  startLoading: () => set({ isLoading: true }),
  stopLoading: () => set({ isLoading: false }),
}));
