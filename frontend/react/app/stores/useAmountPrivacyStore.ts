import { create } from "zustand";
import {
  AMOUNTS_VISIBLE_KEY,
  getStoredItem,
  setStoredItem,
} from "../local/secureStore";

type AmountPrivacyState = {
  areAmountsVisible: boolean;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setAmountsVisible: (visible: boolean) => Promise<void>;
};

export const useAmountPrivacyStore = create<AmountPrivacyState>()((set) => ({
  areAmountsVisible: false,
  isHydrated: false,
  hydrate: async () => {
    const storedValue = await getStoredItem(AMOUNTS_VISIBLE_KEY);
    set({
      areAmountsVisible: storedValue === "true",
      isHydrated: true,
    });
  },
  setAmountsVisible: async (visible) => {
    set({ areAmountsVisible: visible });
    await setStoredItem(AMOUNTS_VISIBLE_KEY, visible.toString());
  },
}));
