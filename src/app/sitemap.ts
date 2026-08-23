import {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000');

  const routes = ['', '/pathnames'];

  return routes.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8
    }))
  );
}
