import {MetadataRoute} from 'next';
import {getTranslations} from 'next-intl/server';
import {routing} from '@/i18n/routing';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations({
    locale: routing.defaultLocale,
    namespace: 'Manifest'
  });

  return {
    name: t('name'),
    short_name: t('short_name'),
    description: t('description'),
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    categories: ['utilities', 'lifestyle'],
    background_color: '#101E33',
    theme_color: '#101E33',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  };
}
