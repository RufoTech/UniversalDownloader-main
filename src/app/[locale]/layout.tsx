import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "../globals.css";
import initTranslations from "../i18n";
import TranslationsProvider from "@/components/TranslationsProvider";
import { i18nConfig } from "../../../i18nConfig";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const { t } = await initTranslations(locale, ['common']);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ethereal-downloader.com';

  // Clean hero title from HTML tags for SEO
  const rawTitle = t('hero_title').replace(/<[^>]*>?/gm, '');
  const title = `${rawTitle} | Ethereal Downloader`;
  const description = t('hero_subtitle');

  // Generate hreflang alternates for all locales
  const languages: Record<string, string> = {};
  i18nConfig.locales.forEach((l) => {
    languages[l] = `${baseUrl}/${l}`;
  });
  languages['x-default'] = `${baseUrl}/${i18nConfig.defaultLocale}`;

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${locale}`,
      siteName: 'Ethereal Downloader',
      locale: locale,
      type: 'website',
      // images: [{ url: '/og-image.png' }], // Add when an OG image is ready
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const { resources } = await initTranslations(locale, ['common']);

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <script src="https://quge5.com/88/tag.min.js" data-zone="221975" async data-cfasync="false"></script>
        <meta name="google-adsense-account" content="ca-pub-7846049673427605" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7846049673427605"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} bg-surface selection:bg-primary/30 min-h-full flex flex-col antialiased`} suppressHydrationWarning>
        <TranslationsProvider namespaces={['common']} locale={locale} resources={resources}>
          {children}
        </TranslationsProvider>
      </body>
    </html>
  );
}
