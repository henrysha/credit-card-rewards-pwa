import { useRegisterSW } from 'virtual:pwa-register/react';

export default function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('SW Registered: ' + !!r);
      if (r) {
        // Periodically check for updates (every hour)
        setInterval(() => {
          console.log('Checking for SW update periodically');
          r.update();
        }, 60 * 60 * 1000);

        // Also check when app comes to foreground (very useful on iOS)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            console.log('App in foreground, checking for SW update');
            r.update();
          }
        });
      }
    },
    onRegisterError(error: unknown) {
      console.error('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="reload-prompt-container">
      <div className="reload-prompt">
        <p>A new version is available! Please reload to update.</p>
        <div className="reload-prompt-actions">
          <button className="btn btn-primary" onClick={() => updateServiceWorker(true)}>
            Reload
          </button>
          <button className="btn" style={{ marginLeft: '10px' }} onClick={() => setNeedRefresh(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
