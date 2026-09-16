import { useEffect, useState } from 'react';

type SupportedPlatform = 'android' | 'ios';
const DISMISSED_STORAGE_KEY = 'pwa_install_guide_dismissed';

function isStandalone() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };

  return window.matchMedia('(display-mode: standalone)').matches
    || navigatorWithStandalone.standalone === true;
}

function getSupportedPlatform(): SupportedPlatform | null {
  const userAgent = navigator.userAgent;

  if (/android/i.test(userAgent)) return 'android';

  const isAppleMobileDevice = /iPad|iPhone|iPod/.test(userAgent)
    || (/Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1);

  return isAppleMobileDevice ? 'ios' : null;
}

function wasDismissed() {
  return localStorage.getItem(DISMISSED_STORAGE_KEY) === 'true';
}

const instructions: Record<SupportedPlatform, { label: string; steps: string[] }> = {
  ios: {
    label: 'iPhone or iPad',
    steps: [
      'Tap the Share button in Safari.',
      'Scroll down and tap “Add to Home Screen.”',
      'Tap “Add” to install the app.',
    ],
  },
  android: {
    label: 'Android',
    steps: [
      'Open your browser menu (⋮).',
      'Tap “Install app” or “Add to Home screen.”',
      'Confirm by tapping “Install.”',
    ],
  },
};

export default function PwaInstallGuide() {
  const [platform, setPlatform] = useState<SupportedPlatform | null>(() => {
    if (isStandalone() || wasDismissed()) return null;
    return getSupportedPlatform() === 'ios' ? 'ios' : null;
  });

  useEffect(() => {
    if (isStandalone() || wasDismissed() || getSupportedPlatform() !== 'android') return;

    const handleInstallable = (event: Event) => {
      event.preventDefault();
      setPlatform('android');
      window.removeEventListener('beforeinstallprompt', handleInstallable);
    };

    window.addEventListener('beforeinstallprompt', handleInstallable);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallable);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
    setPlatform(null);
  };

  if (!platform) return null;

  const guide = instructions[platform];

  return (
    <div className="modal-overlay install-guide-overlay" onClick={dismiss}>
      <section
        className="modal-content install-guide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-guide-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-handle" />
        <div className="install-guide-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12" />
            <polyline points="7 10 12 15 17 10" />
            <path d="M5 21h14" />
          </svg>
        </div>
        <h2 id="install-guide-title">Install the app</h2>
        <p className="install-guide-intro">
          Add Credit Card Rewards to your {guide.label} for quick access and the best experience.
        </p>
        <ol className="install-guide-steps">
          {guide.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <button className="btn btn-primary btn-block" onClick={dismiss} autoFocus>
          Got it
        </button>
      </section>
    </div>
  );
}
