const fs = require('fs');
const path = require('path');

const locales = ['af', 'sq', 'am', 'ar', 'hy', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 'ceb', 'ny', 'zh', 'co', 'hr', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'fi', 'fr', 'fy', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'ha', 'haw', 'he', 'hi', 'hmn', 'hu', 'is', 'ig', 'id', 'ga', 'it', 'ja', 'jv', 'kn', 'kk', 'km', 'rw', 'ko', 'ku', 'ky', 'lo', 'la', 'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mn', 'my', 'ne', 'no', 'or', 'ps', 'fa', 'pl', 'pt', 'pa', 'ro', 'ru', 'sm', 'gd', 'sr', 'st', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'es', 'su', 'sw', 'sv', 'tl', 'ta', 'tt', 'te', 'th', 'tr', 'tk', 'uk', 'ur', 'ug', 'uz', 'vi', 'cy', 'xh', 'yi', 'yo', 'zu'];

const translations = {
  az: {
    hero_title: "İstədiyiniz Platformadan <span class='text-primary'>Anında</span> Yükləyin",
    hero_subtitle: "Sürətli, reklamsız və limitsiz. Yükləməyə başlamaq üçün aşağıdakı platformalardan birini seçin.",
    login: "Daxil ol",
    start: "Başla",
    faq: "FAQ",
    api: "API",
    contact: "Əlaqə",
    youtube_desc: "Video (MP4) & Səs (MP3)",
    tiktok_desc: "Video, Səs & Şəkil",
    instagram_desc: "Video, Reels, Story & Şəkil",
    facebook_desc: "Video & Şəkil",
    vk_desc: "Video & Şəkil",
    search_placeholder: "linkini yapışdırın...",
    search_btn: "Axtar",
    searching: "Axtarılır...",
    download_video: "Video Yüklə (MP4)",
    download_audio: "Səs (MP3)",
    download_image: "Şəkil (JPG/PNG)",
    error_empty_link: "Zəhmət olmasa bir link daxil edin",
    error_fetch: "Məlumat alına bilmədi",
    error_general: "Xəta baş verdi"
  },
  en: {
    hero_title: "Download from Any Platform <span class='text-primary'>Instantly</span>",
    hero_subtitle: "Fast, ad-free, and unlimited. Choose a platform below to start downloading.",
    login: "Login",
    start: "Start",
    faq: "FAQ",
    api: "API",
    contact: "Contact",
    youtube_desc: "Video (MP4) & Audio (MP3)",
    tiktok_desc: "Video, Audio & Image",
    instagram_desc: "Video, Reels, Story & Image",
    facebook_desc: "Video & Image",
    vk_desc: "Video & Image",
    search_placeholder: "paste link here...",
    search_btn: "Search",
    searching: "Searching...",
    download_video: "Download Video (MP4)",
    download_audio: "Audio (MP3)",
    download_image: "Image (JPG/PNG)",
    error_empty_link: "Please enter a link",
    error_fetch: "Failed to fetch data",
    error_general: "An error occurred"
  },
  tr: {
    hero_title: "İstediğiniz Platformdan <span class='text-primary'>Anında</span> İndirin",
    hero_subtitle: "Hızlı, reklamsız ve sınırsız. İndirmeye başlamak için aşağıdaki platformlardan birini seçin.",
    login: "Giriş Yap",
    start: "Başla",
    faq: "SSS",
    api: "API",
    contact: "İletişim",
    youtube_desc: "Video (MP4) & Ses (MP3)",
    tiktok_desc: "Video, Ses & Görsel",
    instagram_desc: "Video, Reels, Hikaye & Görsel",
    facebook_desc: "Video & Görsel",
    vk_desc: "Video & Görsel",
    search_placeholder: "linkini yapıştırın...",
    search_btn: "Ara",
    searching: "Aranıyor...",
    download_video: "Video İndir (MP4)",
    download_audio: "Ses (MP3)",
    download_image: "Görsel (JPG/PNG)",
    error_empty_link: "Lütfen bir link girin",
    error_fetch: "Veri alınamadı",
    error_general: "Bir hata oluştu"
  },
  ru: {
    hero_title: "Скачивайте с любой платформы <span class='text-primary'>мгновенно</span>",
    hero_subtitle: "Быстро, без рекламы и без ограничений. Выберите платформу ниже, чтобы начать скачивание.",
    login: "Войти",
    start: "Начать",
    faq: "ЧаВо",
    api: "API",
    contact: "Контакты",
    youtube_desc: "Видео (MP4) и Аудио (MP3)",
    tiktok_desc: "Видео, Аудио и Фото",
    instagram_desc: "Видео, Reels, Истории и Фото",
    facebook_desc: "Видео и Фото",
    vk_desc: "Видео и Фото",
    search_placeholder: "вставьте ссылку сюда...",
    search_btn: "Поиск",
    searching: "Поиск...",
    download_video: "Скачать видео (MP4)",
    download_audio: "Аудио (MP3)",
    download_image: "Фото (JPG/PNG)",
    error_empty_link: "Пожалуйста, введите ссылку",
    error_fetch: "Не удалось получить данные",
    error_general: "Произошла ошибка"
  }
};

const defaultTranslations = translations.en;

locales.forEach(locale => {
  const dirPath = path.join(__dirname, 'src', 'locales', locale);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const localeData = translations[locale] || defaultTranslations;
  fs.writeFileSync(
    path.join(dirPath, 'common.json'),
    JSON.stringify(localeData, null, 2),
    'utf-8'
  );
});

console.log('Locales generated successfully!');
