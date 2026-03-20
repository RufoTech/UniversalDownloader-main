import { i18nRouter } from 'next-i18n-router';
import { i18nConfig } from '../i18nConfig';
import { NextRequest, NextResponse } from 'next/server';
import { countryToLocale } from './countryToLocale';

// Cache IP → country results in memory (Edge runtime compatible)
const ipCountryCache = new Map<string, { country: string; expires: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function getCountryFromIP(ip: string): Promise<string | null> {
  // Check cache first
  const cached = ipCountryCache.get(ip);
  if (cached && cached.expires > Date.now()) {
    return cached.country;
  }

  try {
    // Use ip-api.com (free, no API key, 45 req/min limit)
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });

    if (!res.ok) return null;

    const data = await res.json();
    const country = data.countryCode || null;

    if (country) {
      ipCountryCache.set(ip, { country, expires: Date.now() + CACHE_TTL });
    }

    return country;
  } catch {
    // On any error (timeout, network), return null — fallback to Accept-Language
    return null;
  }
}

function getClientIP(request: NextRequest): string | null {
  // Try various headers that proxies/CDNs set
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;

  // Next.js built-in (may not be available in all environments)
  return (request as any).ip || null;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the URL already has a valid locale prefix
  const pathnameSegments = pathname.split('/');
  const pathLocale = pathnameSegments[1];
  const hasLocalePrefix = i18nConfig.locales.includes(pathLocale);

  // If user already has a locale in the URL or has a cookie set, use normal routing
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  
  if (hasLocalePrefix || localeCookie) {
    // User has already chosen or been assigned a locale
    return i18nRouter(request, i18nConfig);
  }

  // No cookie and no locale prefix → try IP-based detection
  const clientIP = getClientIP(request);

  if (clientIP && clientIP !== '127.0.0.1' && clientIP !== '::1') {
    const countryCode = await getCountryFromIP(clientIP);

    if (countryCode) {
      const detectedLocale = countryToLocale[countryCode];

      if (detectedLocale && i18nConfig.locales.includes(detectedLocale)) {
        // Set the cookie so future requests don't need IP lookup
        const response = NextResponse.redirect(
          new URL(`/${detectedLocale}${pathname}`, request.url)
        );
        response.cookies.set('NEXT_LOCALE', detectedLocale, {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/',
        });
        return response;
      }
    }
  }

  // Fallback: let next-i18n-router handle it (uses Accept-Language header)
  return i18nRouter(request, i18nConfig);
}

// applies this middleware only to files in the app directory
export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)'
};
