import { getExpiringPerks, getPermanentlyExpiringPerks, getCardTemplate } from './db/helpers';
import { db } from './db/database';

const NOTIFICATION_KEY = 'last_perk_notification';
const PERMANENT_NOTIFICATION_KEY = 'last_permanent_expiry_notification';

/** Request notification permission from the user. Returns the permission state. */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return await Notification.requestPermission();
}

/** Check if we already sent a notification today to avoid spamming. */
function alreadyNotifiedToday(key: string): boolean {
  const last = localStorage.getItem(key);
  if (!last) return false;
  const today = new Date().toISOString().split('T')[0];
  return last === today;
}

function markNotifiedToday(key: string): void {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(key, today);
}

/**
 * Check for perks expiring within 3 days and fire a grouped notification.
 * Only fires once per day.
 */
export async function checkAndNotifyExpiringPerks(): Promise<void> {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (alreadyNotifiedToday(NOTIFICATION_KEY)) return;

  const expiring = await getExpiringPerks(3);
  if (expiring.length === 0) return;

  // Calculate total unclaimed value
  const totalValue = expiring.reduce((sum, p) => sum + (p.periodValue ?? p.annualValue), 0);

  // Build card name lookup
  const cardNames = new Map<number, string>();
  for (const perk of expiring) {
    if (!cardNames.has(perk.cardId)) {
      const card = await db.cards.get(perk.cardId);
      if (card) {
        const template = getCardTemplate(card.cardTemplateId);
        cardNames.set(perk.cardId, template?.name ?? 'Unknown Card');
      }
    }
  }

  const perkList = expiring
    .slice(0, 3)
    .map(p => `• ${p.perkName} (${cardNames.get(p.cardId) ?? ''})`)
    .join('\n');
  const extra = expiring.length > 3 ? `\n...and ${expiring.length - 3} more` : '';

  new Notification('⚠️ Perks Expiring Soon', {
    body: `${expiring.length} perk${expiring.length > 1 ? 's' : ''} worth $${totalValue} expiring soon:\n${perkList}${extra}`,
    icon: '/credit-card-rewards-pwa/pwa-192x192.png',
    tag: 'perk-expiry',
  });

  markNotifiedToday(NOTIFICATION_KEY);
}

/**
 * Check for perks permanently expiring within 30 days (template expirationDate).
 * Only fires once per day, separate from period-based notifications.
 */
export async function checkAndNotifyPermanentExpiry(): Promise<void> {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (alreadyNotifiedToday(PERMANENT_NOTIFICATION_KEY)) return;

  const expiring = await getPermanentlyExpiringPerks(30);
  if (expiring.length === 0) return;

  const perkList = expiring
    .slice(0, 3)
    .map(p => `• ${p.perkName} (ends ${p.expirationDate})`)
    .join('\n');

  new Notification('📅 Perks Permanently Ending', {
    body: `${expiring.length} perk${expiring.length > 1 ? 's' : ''} ending permanently soon:\n${perkList}`,
    icon: '/credit-card-rewards-pwa/pwa-192x192.png',
    tag: 'perk-permanent-expiry',
  });

  markNotifiedToday(PERMANENT_NOTIFICATION_KEY);
}

/** Run all notification checks. Call on app open and foreground. */
export async function runNotificationChecks(): Promise<void> {
  await checkAndNotifyExpiringPerks();
  await checkAndNotifyPermanentExpiry();
}
