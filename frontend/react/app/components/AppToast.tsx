import Toast, { ToastShowParams } from "react-native-toast-message";

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
      text1: title ?? "Success",
      text2: message,
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
      text1: title ?? "Error",
      text2: message,
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
      text1: title ?? "Warning",
      text2: message,
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
      text1: title ?? "Info",
      text2: message,
      visibilityTime: duration,
      position: position,
    });
  },
};
