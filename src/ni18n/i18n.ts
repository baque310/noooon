import UniversalCookie from 'universal-cookie';
import en from '../../public/locales/en.json';
import ar from '../../public/locales/ar.json';

// Create a type for the keys of the translation files
// Utility type to recursively extract all keys from a nested object
type NestedKeys<T> = {
  [K in keyof T]: T[K] extends object ? `${K & string}.${NestedKeys<T[K]>}` : K & string
}[keyof T];

// TranslationKeys type to include all keys from both en and ar
export type TranslationKeys = NestedKeys<typeof en> | NestedKeys<typeof ar>;


// Type for localization data
interface LocaleData {
  [key: string]: any;
}

interface Locales {
  en: LocaleData;
  ar: LocaleData;
}
const cookieObj = typeof window === 'undefined' ?
  require('next/headers') :
  require('universal-cookie');

// Create an object containing the localization data
const langObj: Locales = { en, ar };

const getLang = (): string | null => {
  if (typeof window !== 'undefined') {
    const cookies = new UniversalCookie();
    return cookies.get('i18nextLng');
  } else {
    const cookies = cookieObj.cookies();
    return cookies.get('i18nextLng')?.value || null;
  }
};

export const getTranslation = () => {
  const lang = getLang() || 'en';
  const data: LocaleData = langObj[lang as keyof Locales] || en

  const t = (key: TranslationKeys | "" = ""): string => {
    const keys = key.split('.');
    let result: any = data;

    for (const k of keys) {
      result = result[k as keyof typeof result];
      if (result === undefined) {
        return key;
      }
    }

    return result || key;
  };

  const initLocale = (themeLocale: string) => {
    const currentLang = getLang();
    i18n.changeLanguage(currentLang || themeLocale);
  };

  const i18n = {
    language: lang,
    changeLanguage: (newLang: string) => {
      const cookies = new UniversalCookie();
      cookies.set('i18nextLng', newLang, { path: '/' });
    },
  };

  return { t, i18n, initLocale };
};