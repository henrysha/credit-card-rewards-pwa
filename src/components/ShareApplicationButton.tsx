import { useToast } from './ToastContext';

const SHARE_TITLE = 'Credit Card Rewards Tracker';
const SHARE_TEXT = 'Track credit card rewards, sign-up bonuses, and perks — fully offline';

function getApplicationUrl() {
  return new URL(import.meta.env.BASE_URL, window.location.origin).toString();
}

export function ShareApplicationButton({ onShare }: { onShare?: () => void }) {
  const { showToast } = useToast();

  const handleShare = async () => {
    onShare?.();

    const shareData = {
      title: SHARE_TITLE,
      text: SHARE_TEXT,
      url: getApplicationUrl(),
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showToast('App shared successfully');
        return;
      }

      await navigator.clipboard.writeText(shareData.url);
      showToast('App link copied to clipboard');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      showToast('Unable to share the app');
    }
  };

  return (
    <button className="dropdown-item" onClick={handleShare}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      Share App
    </button>
  );
}
