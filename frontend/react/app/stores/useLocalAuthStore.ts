import { create } from "zustand";
import { BIOMETRIC_LOCK_KEY, PIN_PATTERN_LOCK_KEY } from "../local/secureStore";

export type LocalAuthType =
  | typeof BIOMETRIC_LOCK_KEY
  | typeof PIN_PATTERN_LOCK_KEY
  | null;

type LocalAuthState = {
  localAuthType: LocalAuthType;
  setLocalAuthType: (type: LocalAuthType) => void;
};

export const useLocalAuthStore = create<LocalAuthState>()((set) => ({
  localAuthType: null,
  setLocalAuthType: (type: LocalAuthType) => set({ localAuthType: type }),
}));
