import { create } from "zustand";
import { BIOMETRIC_LOCK_KEY, PIN_PATTERN_LOCK_KEY } from "../local/secureStore";
import dayjs from "dayjs";

export const MAX_AUTH_ATTEMPTS = 3;
export const AUTH_ERROR_RESET_MINUTES = 10;
export const ACCOUNT_FROZEN_SECONDS = 30;

export type LocalAuthType =
  | typeof BIOMETRIC_LOCK_KEY
  | typeof PIN_PATTERN_LOCK_KEY
  | null;

type LocalAuthState = {
  localAuthType: LocalAuthType;
  isAppPINCreated: boolean;
  authErrorCounter: number;
  lastErrorAuthDateTime: dayjs.Dayjs | null;
  setLocalAuthType: (type: LocalAuthType) => void;
  setIsAppPINCreated: (value: boolean) => void;
  setAuthErrorCounter: (value: number) => void;
  setLastErrorAuthDateTime: (reLoginDt: dayjs.Dayjs | null) => void;
};

export const useLocalAuthStore = create<LocalAuthState>()((set) => ({
  localAuthType: null,
  isAppPINCreated: false,
  authErrorCounter: 3,
  lastErrorAuthDateTime: null,
  setLocalAuthType: (type: LocalAuthType) => set({ localAuthType: type }),
  setIsAppPINCreated: (value: boolean) => set({ isAppPINCreated: value }),
  setAuthErrorCounter: (value: number) => set({ authErrorCounter: value }),
  setLastErrorAuthDateTime: (value: dayjs.Dayjs | null) =>
    set({ lastErrorAuthDateTime: value }),
}));
