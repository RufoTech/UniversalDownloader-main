import { Metadata, ResolvingMetadata } from "next";
import initTranslations from "../../../i18n";
import DownloaderClient from "./DownloaderClient";
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook, FaVk } from "react-icons/fa";

const platformConfig: any = {
  youtube: { name: 'YouTube', icon: FaYoutube, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  tiktok: { name: 'TikTok', icon: FaTiktok, color: 'text-black dark:text-white', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
  instagram: { name: 'Instagram', icon: FaInstagram, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  facebook: { name: 'Facebook', icon: FaFacebook, color: 'text-blue-600', bg: 'bg-blue-600/10', border: 'border-blue-600/20' },
  vk: { name: 'VK', icon: FaVk, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' }
};

type Props = {
  params: Promise<{ locale: string; platform: string }>;
};

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const platformKey = resolvedParams.platform.toLowerCase();
  const config = platformConfig[platformKey] || platformConfig.youtube;
  
  const { t } = await initTranslations(locale, ['common']);
  
  const title = `${config.name} Downloader - Ethereal Downloader`;
  const description = t('platform_description', { platform: config.name });
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ethereal-downloader.com';
  const url = `${baseUrl}/${locale}/downloader/${platformKey}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
    },
    twitter: {
      title,
      description,
    }
  };
}

export default function DownloaderPage({ params }: Props) {
  return <DownloaderClient params={params} />;
}
