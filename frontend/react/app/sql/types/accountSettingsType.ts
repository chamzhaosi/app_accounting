import type { Language } from "../../stores/useLanguageStore";

export type AccountSettingsType = {
  nickname: string;
  email: string;
  language: Language;
};
