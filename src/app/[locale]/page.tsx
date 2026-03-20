"use client";
import Link from "next/link";
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook, FaVk } from "react-icons/fa";
import { SiOpenai } from "react-icons/si";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import JsonLd from "@/components/JsonLd";

export default function Home() {
  const { t, i18n } = useTranslation('common');
  const currentLocale = i18n.language;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ethereal-downloader.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['WebSite', 'SoftwareApplication'],
    name: 'Ethereal Downloader',
    url: `${baseUrl}/${currentLocale}`,
    description: t('hero_subtitle'),
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    inLanguage: currentLocale,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-[#192540]/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center px-8 h-20 w-full max-w-7xl mx-auto">
          <div className="text-2xl font-black tracking-tighter text-[#dee5ff] font-manrope">
            Ethereal Downloader
          </div>
          <div className="hidden md:flex items-center gap-8 font-manrope text-sm font-medium tracking-wide">
            <a className="text-[#dee5ff]/70 hover:text-[#dee5ff] transition-colors" href="#">{t('faq')}</a>
            <a className="text-[#dee5ff]/70 hover:text-[#dee5ff] transition-colors" href="#">{t('api')}</a>
            <a className="text-[#dee5ff]/70 hover:text-[#dee5ff] transition-colors" href="#">{t('contact')}</a>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button className="hidden md:block px-6 py-2 rounded-xl text-sm font-bold text-[#dee5ff]/70 hover:text-[#dee5ff] transition-all">
              {t('login')}
            </button>
            <button className="signature-pulse px-6 py-2.5 rounded-xl text-sm font-bold text-on-primary shadow-lg hover:scale-105 transition-all duration-300 active:scale-95">
              {t('start')}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto text-center flex flex-col items-center">
          <h1 
            className="font-manrope text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl text-on-surface"
            dangerouslySetInnerHTML={{ __html: t('hero_title') }}
          />
          <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mb-12 font-body">
            {t('hero_subtitle')}
          </p>

          {/* Social Platforms Grid (Main interaction point) */}
          <nav aria-label="Supported Platforms" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-5xl mt-8">
            <Link href={`/${currentLocale}/downloader/youtube`} aria-label="YouTube Downloader" className="bg-surface-container hover:bg-surface-container-high p-8 rounded-xl flex flex-col items-center gap-4 transition-all group hover:-translate-y-2 hover:shadow-xl border border-transparent hover:border-red-500/30">
              <FaYoutube className="text-5xl text-on-surface-variant group-hover:text-red-500 transition-colors" />
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg tracking-wide">YouTube</span>
                <span className="text-xs text-on-surface-variant mt-1 text-center">{t('youtube_desc')}</span>
              </div>
            </Link>
            
            <Link href={`/${currentLocale}/downloader/tiktok`} className="bg-surface-container hover:bg-surface-container-high p-8 rounded-xl flex flex-col items-center gap-4 transition-all group hover:-translate-y-2 hover:shadow-xl border border-transparent hover:border-gray-500/30">
              <FaTiktok className="text-5xl text-on-surface-variant group-hover:text-white transition-colors" />
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg tracking-wide">TikTok</span>
                <span className="text-xs text-on-surface-variant mt-1 text-center">{t('tiktok_desc')}</span>
              </div>
            </Link>
            
            <Link href={`/${currentLocale}/downloader/instagram`} className="bg-surface-container hover:bg-surface-container-high p-8 rounded-xl flex flex-col items-center gap-4 transition-all group hover:-translate-y-2 hover:shadow-xl border border-transparent hover:border-pink-500/30">
              <FaInstagram className="text-5xl text-on-surface-variant group-hover:text-pink-500 transition-colors" />
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg tracking-wide">Instagram</span>
                <span className="text-xs text-on-surface-variant mt-1 text-center">{t('instagram_desc')}</span>
              </div>
            </Link>
            
            <Link href={`/${currentLocale}/downloader/facebook`} className="bg-surface-container hover:bg-surface-container-high p-8 rounded-xl flex flex-col items-center gap-4 transition-all group hover:-translate-y-2 hover:shadow-xl border border-transparent hover:border-blue-600/30">
              <FaFacebook className="text-5xl text-on-surface-variant group-hover:text-blue-600 transition-colors" />
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg tracking-wide">Facebook</span>
                <span className="text-xs text-on-surface-variant mt-1 text-center">{t('facebook_desc')}</span>
              </div>
            </Link>
            
            <Link href={`/${currentLocale}/downloader/vk`} className="bg-surface-container hover:bg-surface-container-high p-8 rounded-xl flex flex-col items-center gap-4 transition-all group hover:-translate-y-2 hover:shadow-xl border border-transparent hover:border-blue-400/30">
              <FaVk className="text-5xl text-on-surface-variant group-hover:text-blue-400 transition-colors" />
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg tracking-wide">VK</span>
                <span className="text-xs text-on-surface-variant mt-1 text-center">{t('vk_desc')}</span>
              </div>
            </Link>
          </nav>
        </section>

       

     

      
      </main>

      {/* Footer */}
      <footer className="bg-[#060e20] w-full border-t border-[#40485d]/15 mt-40">
        <div className="flex flex-col md:flex-row justify-between items-center py-12 px-8 w-full max-w-7xl mx-auto gap-8">
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold text-[#dee5ff] font-manrope">Ethereal Downloader</div>
            <p className="font-inter text-xs text-[#dee5ff]/50">© 2024 Ethereal Downloader. Built for the Digital Alchemist.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="font-inter text-xs text-[#dee5ff]/50 hover:text-[#a3a6ff] transition-colors" href="#">Terms of Service</a>
            <a className="font-inter text-xs text-[#dee5ff]/50 hover:text-[#a3a6ff] transition-colors" href="#">Privacy Policy</a>
            <a className="font-inter text-xs text-[#dee5ff]/50 hover:text-[#a3a6ff] transition-colors" href="#">Status</a>
            <a className="font-inter text-xs text-[#dee5ff]/50 hover:text-[#a3a6ff] transition-colors" href="#">Documentation</a>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-sm">alternate_email</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-sm">terminal</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
