declare module 'virtual:pwa-register/react' {
  import { Dispatch, SetStateAction } from 'react';

  export interface RegisterSWOptions {
    immediate?: boolean;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: unknown) => void;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
  }

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: [boolean, Dispatch<SetStateAction<boolean>>];
    offlineReady: [boolean, Dispatch<SetStateAction<boolean>>];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}
