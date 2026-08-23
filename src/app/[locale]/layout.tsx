import type {Metadata, Viewport} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getTranslations} from 'next-intl/server';
import {clsx} from 'clsx';
import {Inter} from 'next/font/google';
import {Toaster} from 'sonner';
import {routing} from '@/i18n/routing';
import Navigation from '@/components/Navigation';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import './globals.css';

const inter = Inter({subsets: ['latin']});

export const viewport: Viewport = {
  themeColor: '#101E33',
  width: 'device-width',
  initialScale: 1
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations('LocaleLayout');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t('title'),
      template: `%s | ${t('title')}`
    },
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: './',
      siteName: t('title'),
      locale,
      type: 'website',
      images: [
        {
          url: '/icons/logo.png',
          width: 512,
          height: 512,
          alt: t('title')
        }
      ]
    },
    twitter: {
      card: 'summary',
      title: t('title'),
      description: t('description'),
      images: ['/icons/logo.png']
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/icons/apple-touch-icon.png'
    },
    alternates: {
      canonical: './',
      languages: {
        en: '/en',
        de: '/de'
      }
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: t('title')
    },
    formatDetection: {
      telephone: false
    }
  };
}

export default async function LocaleLayout({
  children
}: LayoutProps<'/[locale]'>) {
  const locale = await getLocale();

  return (
    <html className="h-full" lang={locale}>
      <body className={clsx(inter.className, 'flex h-full flex-col')}>
        <NextIntlClientProvider>
          <ServiceWorkerRegister />
          <Navigation />
          {children}
          <Toaster position="bottom-right" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
