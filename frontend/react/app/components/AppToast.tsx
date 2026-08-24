import Toast, { ToastShowParams } from "react-native-toast-message";
import { translate } from "../i18n";

type ToastType = ToastShowParams & {
  title?: string;
  message: string;
  duration?: number;
};

export const AppToast = {
  success: ({
    title,
    message,
    duration = 3000,
    position = "bottom",
  }: ToastType) => {
    Toast.show({
      type: "success",
      text1: translate(title ?? "Success"),
      text2: translate(message),
      visibilityTime: duration,
      position: position,
    });
  },
  error: ({
    title,
    message,
    duration = 3000,
    position = "bottom",
  }: ToastType) => {
    Toast.show({
      type: "error",
      text1: translate(title ?? "Error"),
      text2: translate(message),
      visibilityTime: duration,
      position: position,
    });
  },

  warning: ({
    title,
    message,
    duration = 3000,
    position = "bottom",
  }: ToastType) => {
    Toast.show({
      type: "warning",
      text1: translate(title ?? "Warning"),
      text2: translate(message),
      visibilityTime: duration,
      position: position,
    });
  },

  info: ({
    title,
    message,
    duration = 3000,
    position = "bottom",
  }: ToastType) => {
    Toast.show({
      type: "info",
      text1: translate(title ?? "Info"),
      text2: translate(message),
      visibilityTime: duration,
      position: position,
    });
  },
};
