import { create } from "zustand";
import {
  getStoredItem,
  LANGUAGE_KEY,
  setStoredItem,
} from "../local/secureStore";

export type Language = "en" | "zh-Hans" | "ms";

type LanguageState = {
  language: Language;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
};

const isLanguage = (value: string | null): value is Language =>
  value === "en" || value === "zh-Hans" || value === "ms";

export const useLanguageStore = create<LanguageState>()((set) => ({
  language: "en",
  isHydrated: false,
  hydrate: async () => {
    const storedLanguage = await getStoredItem(LANGUAGE_KEY);
    set({
      language: isLanguage(storedLanguage) ? storedLanguage : "en",
      isHydrated: true,
    });
  },
  setLanguage: async (language) => {
    set({ language });
    await setStoredItem(LANGUAGE_KEY, language);
  },
}));
