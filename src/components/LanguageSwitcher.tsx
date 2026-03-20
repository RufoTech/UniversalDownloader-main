"use client";

import { useRouter, usePathname } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { i18nConfig } from '../../i18nConfig';

const LANGUAGE_NAMES: Record<string, string> = {
  "af": "Afrikaans", "sq": "Shqip", "am": "አማርኛ", "ar": "العربية", "hy": "Հայերեն",
  "az": "Azərbaycan", "eu": "Euskara", "be": "Беларуская", "bn": "বাংলা", "bs": "Bosanski",
  "bg": "Български", "ca": "Català", "ceb": "Cebuano", "ny": "Chichewa", "zh": "中文",
  "co": "Corsican", "hr": "Hrvatski", "cs": "Čeština", "da": "Dansk", "nl": "Nederlands",
  "en": "English", "eo": "Esperanto", "et": "Eesti", "fi": "Suomi", "fr": "Français",
  "fy": "Frysk", "gl": "Galego", "ka": "Ქართული", "de": "Deutsch", "el": "Ελληνικά",
  "gu": "ગુજરાતી", "ht": "Kreyòl ayisyen", "ha": "Hausa", "haw": "ʻŌlelo Hawaiʻi", "he": "עברית",
  "hi": "हिन्दी", "hmn": "Hmong", "hu": "Magyar", "is": "Íslenska", "ig": "Igbo",
  "id": "Indonesia", "ga": "Gaeilge", "it": "Italiano", "ja": "日本語", "jv": "Jawa",
  "kn": "ಕನ್ನಡ", "kk": "Қазақ тілі", "km": "ខ្មែរ", "rw": "Ikinyarwanda", "ko": "한국어",
  "ku": "Kurdî", "ky": "Кыргызча", "lo": "ລາວ", "la": "Latina", "lv": "Latviešu",
  "lt": "Lietuvių", "lb": "Lëtzebuergesch", "mk": "Македонски", "mg": "Malagasy", "ms": "Melayu",
  "ml": "മലയാളം", "mt": "Malti", "mi": "Māori", "mr": "मराठी", "mn": "Монгол",
  "my": "မြန်မာ", "ne": "नेपाली", "no": "Norsk", "or": "ଓଡ଼ିଆ", "ps": "پښتو",
  "fa": "فارسی", "pl": "Polski", "pt": "Português", "pa": "ਪੰਜਾਬੀ", "ro": "Română",
  "ru": "Русский", "sm": "Samoa", "gd": "Gàidhlig", "sr": "Српски", "st": "Sesotho",
  "sn": "ChiShona", "sd": "سنڌي", "si": "සිංහල", "sk": "Slovenčina", "sl": "Slovenščina",
  "so": "Soomaali", "es": "Español", "su": "Basa Sunda", "sw": "Kiswahili", "sv": "Svenska",
  "tl": "Filipino", "ta": "தமிழ்", "tt": "Татар", "te": "తెలుగు", "th": "ไทย",
  "tr": "Türkçe", "tk": "Türkmen dili", "uk": "Українська", "ur": "اردو", "ug": "ئۇيغۇرچە",
  "uz": "O‘zbek", "vi": "Tiếng Việt", "cy": "Cymraeg", "xh": "IsiXhosa", "yi": "ייִדיש",
  "yo": "Èdè Yorùbá", "zu": "IsiZulu"
};

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const currentPathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLocale = i18n.language || i18nConfig.defaultLocale;

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;

    // set cookie for next-i18n-router
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${date.toUTCString()};path=/`;

    // Replace the locale segment in the path
    // With prefixDefault: true, the path always starts with /<locale>/
    const segments = currentPathname.split('/');
    // segments[0] is empty string (before first /), segments[1] is the locale
    if (segments.length > 1 && i18nConfig.locales.includes(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    const newPath = segments.join('/') || '/';

    router.push(newPath);
    router.refresh();
  };

  const getLanguageName = (code: string) => {
    return LANGUAGE_NAMES[code] || code.toUpperCase();
  };

  if (!mounted) {
    return (
      <div className="relative inline-block text-left mr-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-variant/30 rounded-lg border border-outline-variant/30 hover:bg-surface-variant/50 transition-colors opacity-0">
           <span className="material-symbols-outlined text-sm text-on-surface-variant">language</span>
           <div className="w-28 md:w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left mr-4">
      <div className="flex items-center gap-2 px-3 py-2 bg-surface-variant/30 rounded-lg border border-outline-variant/30 hover:bg-surface-variant/50 transition-colors">
        <span className="material-symbols-outlined text-sm text-on-surface-variant">language</span>
        <select
          value={currentLocale}
          onChange={handleChange}
          className="bg-transparent text-sm font-medium text-on-surface-variant focus:outline-none cursor-pointer appearance-none pr-4 w-28 md:w-32 truncate"
          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
        >
          {i18nConfig.locales.map((locale) => (
            <option key={locale} value={locale} className="bg-surface text-on-surface">
              {getLanguageName(locale)} ({locale.toUpperCase()})
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined text-sm absolute right-2 pointer-events-none text-on-surface-variant/50">expand_more</span>
      </div>
    </div>
  );
}
