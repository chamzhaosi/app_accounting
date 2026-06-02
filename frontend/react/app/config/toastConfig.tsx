import {
  BaseToast,
  BaseToastProps,
  ErrorToast,
  InfoToast,
} from "react-native-toast-message";
import { FONTS } from "../constants/fonts";
import { ThemeState } from "../stores/useThemeStore";

const shardProps = (THEME: ThemeState["THEME"]): BaseToastProps => {
  return {
    text2NumberOfLines: 3,
    style: {
      borderLeftWidth: 0,
      height: "auto",
      paddingBlock: 10,
    },
    text1Style: {
      fontSize: 17,
      fontWeight: "bold",
      color: THEME.TOAST_TEXT,
    },
    text2Style: {
      fontSize: 14,
      fontFamily: FONTS.ROBOTO_MONO,
      color: THEME.TOAST_TEXT,
    },
  };
};

export const toastConfig = (THEME: ThemeState["THEME"]) => {
  const _sharedPorps = shardProps(THEME);

  return {
    success: (props: any) => (
      <BaseToast
        {...props}
        {..._sharedPorps}
        style={{
          ..._sharedPorps.style,
          backgroundColor: THEME.TOAST_BG_SUCCESS,
        }}
        text1Style={{
          ..._sharedPorps.text1Style,
        }}
        text2Style={{
          ..._sharedPorps.text2Style,
        }}
      />
    ),

    error: (props: any) => (
      <ErrorToast
        {...props}
        {..._sharedPorps}
        style={{
          ..._sharedPorps.style,
          backgroundColor: THEME.TOAST_BG_ERROR,
        }}
        text1Style={{
          ..._sharedPorps.text1Style,
        }}
        text2Style={{
          ..._sharedPorps.text2Style,
        }}
      />
    ),

    info: (props: any) => (
      <InfoToast
        {...props}
        {..._sharedPorps}
        style={{
          ..._sharedPorps.style,
          backgroundColor: THEME.TOAST_BG_INFO,
        }}
        text1Style={{
          ..._sharedPorps.text1Style,
        }}
        text2Style={{
          ..._sharedPorps.text2Style,
        }}
      />
    ),

    warning: (props: any) => (
      <InfoToast
        {...props}
        {..._sharedPorps}
        style={{
          ..._sharedPorps.style,
          backgroundColor: THEME.TOAST_BG_WARNING,
        }}
        text1Style={{
          ..._sharedPorps.text1Style,
        }}
        text2Style={{
          ..._sharedPorps.text2Style,
        }}
      />
    ),
  };
};
