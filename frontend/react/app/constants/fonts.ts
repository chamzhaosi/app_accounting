import { MD3Theme } from "react-native-paper";

export const FONTS = {
  ROBOTO: "ROBOTO", // Body / Label
  ADLAM_DISPLAY: "ADLAM_DISPLAY", // Display / Title
} as const;

export const FONTS_THEME = (DefaultTheme: MD3Theme) => ({
  displayLarge: {
    ...DefaultTheme.fonts.displayLarge,
    fontFamily: FONTS.ADLAM_DISPLAY,
  },

  displayMedium: {
    ...DefaultTheme.fonts.displayMedium,
    fontFamily: FONTS.ADLAM_DISPLAY,
  },

  displaySmall: {
    ...DefaultTheme.fonts.displaySmall,
    fontFamily: FONTS.ADLAM_DISPLAY,
  },

  headlineLarge: {
    ...DefaultTheme.fonts.headlineLarge,
    fontFamily: FONTS.ADLAM_DISPLAY,
  },

  headlineMedium: {
    ...DefaultTheme.fonts.headlineMedium,
    fontFamily: FONTS.ADLAM_DISPLAY,
  },

  headlineSmall: {
    ...DefaultTheme.fonts.headlineSmall,
    fontFamily: FONTS.ADLAM_DISPLAY,
  },

  titleLarge: {
    ...DefaultTheme.fonts.titleLarge,
    fontFamily: FONTS.ADLAM_DISPLAY,
  },

  titleMedium: {
    ...DefaultTheme.fonts.titleMedium,
    fontFamily: FONTS.ADLAM_DISPLAY,
  },

  titleSmall: {
    ...DefaultTheme.fonts.titleSmall,
    fontFamily: FONTS.ADLAM_DISPLAY,
  },

  bodyLarge: {
    ...DefaultTheme.fonts.bodyLarge,
    fontFamily: FONTS.ROBOTO,
  },

  bodyMedium: {
    ...DefaultTheme.fonts.bodyMedium,
    fontFamily: FONTS.ROBOTO,
  },

  bodySmall: {
    ...DefaultTheme.fonts.bodySmall,
    fontFamily: FONTS.ROBOTO,
  },

  labelLarge: {
    ...DefaultTheme.fonts.labelLarge,
    fontFamily: FONTS.ROBOTO,
  },

  labelMedium: {
    ...DefaultTheme.fonts.labelMedium,
    fontFamily: FONTS.ROBOTO,
  },

  labelSmall: {
    ...DefaultTheme.fonts.labelSmall,
    fontFamily: FONTS.ROBOTO,
  },
});
