import { MetadataRoute } from 'next';
import { i18nConfig } from '../../i18nConfig';

const platforms = ['', '/downloader/youtube', '/downloader/tiktok', '/downloader/instagram', '/downloader/facebook', '/downloader/vk'];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ethereal-downloader.com';

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // For each platform page (root and specific downloaders)
  platforms.forEach((platformPath) => {
    // Generate the hreflang alternate languages object for this path
    const languages: Record<string, string> = {};
    
    // Add all 107 supported locales
    i18nConfig.locales.forEach((locale) => {
      // With prefixDefault: true, all paths start with /locale
      languages[locale] = `${baseUrl}/${locale}${platformPath}`;
    });
    
    // Also add x-default pointing back to default locale (az in this case)
    languages['x-default'] = `${baseUrl}/${i18nConfig.defaultLocale}${platformPath}`;

    // Add entry for each locale exactly as Next.js recommends
    i18nConfig.locales.forEach((locale) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${platformPath}`,
        lastModified: new Date(),
        changeFrequency: platformPath === '' ? 'daily' : 'weekly',
        priority: platformPath === '' ? 1.0 : 0.8,
        alternates: {
          languages: languages
        }
      });
    });
  });

  return sitemapEntries;
}
