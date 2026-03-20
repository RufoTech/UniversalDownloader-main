import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Assuming the production domain will be the canonical one,
  // typically passed via env variables, but using a placeholder/default for now
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ethereal-downloader.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/_next/',
        '/static/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
