'use client';

import {useEffect} from 'react';
import {toast} from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>;
}

declare global {
  interface Window {
    deferredPWAInstallPrompt?: BeforeInstallPromptEvent;
  }
}

const TOAST_ID = 'pwa-install-toast';

export function InstallPrompt() {
  useEffect(() => {
    // Don't show install toast if app is already running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window);
    const isAndroid = /Android/i.test(userAgent);

    if (isIOS) {
      toast.info('Instalar Aplicación', {
        id: TOAST_ID,
        description:
          'En Safari, pulsa el botón Compartir ⎋ y luego "Agregar a inicio" ➕ para instalar la app.',
        duration: 10000
      });
      return;
    }

    const showInstallToast = (promptEvent: BeforeInstallPromptEvent) => {
      toast.info('¿Instalar Aplicación?', {
        id: TOAST_ID,
        description:
          'Obtén un acceso más rápido y experiencia offline instalando la app.',
        action: {
          label: 'Instalar',
          onClick: () => {
            promptEvent.prompt();
            promptEvent.userChoice.then(() => {
              toast.success('¡Gracias por instalar la aplicación!', {
                id: TOAST_ID
              });
              delete window.deferredPWAInstallPrompt;
            });
          }
        },
        duration: 12000
      });
    };

    let promptCaptured = false;

    // Check if event was captured before component hydration
    if (window.deferredPWAInstallPrompt) {
      promptCaptured = true;
      showInstallToast(window.deferredPWAInstallPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      promptCaptured = true;
      const deferredPrompt = e as BeforeInstallPromptEvent;
      window.deferredPWAInstallPrompt = deferredPrompt;
      showInstallToast(deferredPrompt);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Fallback for Android or Desktop if beforeinstallprompt doesn't fire automatically
    const timer = setTimeout(() => {
      if (!promptCaptured && isAndroid) {
        toast.info('Instalar Aplicación', {
          id: TOAST_ID,
          description:
            'En Chrome/Navegador, abre el menú (⋮) y selecciona "Instalar aplicación" o "Agregar a pantalla principal".',
          duration: 10000
        });
      }
    }, 1200);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      clearTimeout(timer);
    };
  }, []);

  return null;
}
