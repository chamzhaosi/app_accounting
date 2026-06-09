import { EdgeInsets } from "react-native-safe-area-context";
import {
  BaseToast,
  BaseToastProps,
  ErrorToast,
  InfoToast,
} from "react-native-toast-message";
import { FONTS } from "../constants/fonts";
import { ThemeState } from "../stores/useThemeStore";

const shardProps = (insets: EdgeInsets): BaseToastProps => {
  return {
    text2NumberOfLines: 3,
    style: {
      borderLeftWidth: 0,
      height: "auto",
      paddingBlock: 10,
      marginTop: insets.top,
      marginBottom: insets.bottom,
    },
    text1Style: {
      fontSize: 17,
      fontWeight: "bold",
    },
    text2Style: {
      fontSize: 14,
      fontFamily: FONTS.ROBOTO,
    },
  };
};

export const toastConfig = (THEME: ThemeState["THEME"], insets: EdgeInsets) => {
  const _sharedPorps = shardProps(insets);

  return {
    success: (props: any) => (
      <BaseToast
        {...props}
        {..._sharedPorps}
        style={{
          ..._sharedPorps.style,
          backgroundColor: THEME.success,
        }}
        text1Style={{
          ..._sharedPorps.text1Style,
          color: THEME.onSuccess,
        }}
        text2Style={{
          ..._sharedPorps.text2Style,
          color: THEME.onSuccess,
        }}
      />
    ),

    error: (props: any) => (
      <ErrorToast
        {...props}
        {..._sharedPorps}
        style={{
          ..._sharedPorps.style,
          backgroundColor: THEME.error,
        }}
        text1Style={{
          ..._sharedPorps.text1Style,
          color: THEME.onError,
        }}
        text2Style={{
          ..._sharedPorps.text2Style,
          color: THEME.onError,
        }}
      />
    ),

    info: (props: any) => (
      <InfoToast
        {...props}
        {..._sharedPorps}
        style={{
          ..._sharedPorps.style,
          backgroundColor: THEME.info,
        }}
        text1Style={{
          ..._sharedPorps.text1Style,
          color: THEME.onInfo,
        }}
        text2Style={{
          ..._sharedPorps.text2Style,
          color: THEME.onInfo,
        }}
      />
    ),

    warning: (props: any) => (
      <InfoToast
        {...props}
        {..._sharedPorps}
        style={{
          ..._sharedPorps.style,
          backgroundColor: THEME.warning,
        }}
        text1Style={{
          ..._sharedPorps.text1Style,
          color: THEME.onWarning,
        }}
        text2Style={{
          ..._sharedPorps.text2Style,
          color: THEME.onWarning,
        }}
      />
    ),
  };
};
