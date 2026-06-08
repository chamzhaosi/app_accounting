import { create } from "zustand";

type ToastState = {
  isShow: boolean;
  setShowToast: () => void;
  setHideToast: () => void;
};

export const useToastStore = create<ToastState>()((set) => ({
  isShow: false,
  setShowToast: () => set({ isShow: true }),
  setHideToast: () => set({ isShow: false }),
}));
