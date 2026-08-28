import { useCallback } from "react";
import { useLocales } from "expo-localization";
import { type Language, useLanguageStore } from "../stores/useLanguageStore";
import { ms } from "./ms";
import { zhHans } from "./zh-Hans";

type TranslationValues = Record<string, string | number>;

const interpolate = (text: string, values?: TranslationValues) => {
  if (!values) return text;

  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    text,
  );
};

export const getLocale = (language: Language) => {
  if (language === "zh-Hans") return "zh-CN";
  if (language === "ms") return "ms-MY";
  return "en-US";
};

export const translate = (
  text: string,
  values?: TranslationValues,
  language = useLanguageStore.getState().language,
) => {
  const normalizedText = text.replace(/\s+/g, " ").trim();
  const translations = language === "zh-Hans" ? zhHans : ms;
  const translated =
    language === "en" ? text : (translations[normalizedText] ?? text);
  return interpolate(translated, values);
};

export const useTranslation = () => {
  const language = useLanguageStore((state) => state.language);
  const locales = useLocales();
  const t = useCallback(
    (text: string, values?: TranslationValues) =>
      translate(text, values, language),
    [language],
  );

  return { language, locale: locales[0]?.languageTag ?? "en-MY", t };
};
