import { create } from "zustand";
import { DARK, LIGHT } from "../constants/colors";

export type ThemeType = "light" | "dark" | "unspecified";

export type ThemeState = {
  isDark: boolean;
  THEME: typeof DARK | typeof LIGHT;
  toggleTheme: (theme: ThemeType) => void;
};

export const useThemeStore = create<ThemeState>((set) => {
  return {
    isDark: false,
    THEME: LIGHT,
    toggleTheme: (theme) =>
      set(() => ({
        isDark: theme === "dark",
        THEME: theme === "dark" ? DARK : LIGHT,
      })),
  };
});
