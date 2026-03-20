import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "../globals.css";
import initTranslations from "../i18n";
import TranslationsProvider from "@/components/TranslationsProvider";
import { i18nConfig } from "../../../i18nConfig";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ethereal Downloader | The Digital Alchemist",
  description: "Download Videos from Any Platform Instantly",
};

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
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
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
