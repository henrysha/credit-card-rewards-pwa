import Dexie, { type EntityTable } from 'dexie';
import type { UserCard, SignupBonus, UserPerk } from './types';

const getDbName = () => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    let testDb = params.get('test_db');
    if (testDb) {
      sessionStorage.setItem('test_db', testDb);
    } else {
      testDb = sessionStorage.getItem('test_db');
    }
    if (testDb) return `CCRewards_Test_${testDb}`;
  }
  return 'CreditCardRewardsDB';
};

const db = new Dexie(getDbName()) as Dexie & {
  cards: EntityTable<UserCard, 'id'>;
  signupBonuses: EntityTable<SignupBonus, 'id'>;
  perks: EntityTable<UserPerk, 'id'>;
};

db.version(1).stores({
  cards: '++id, cardTemplateId, status, openedDate',
  signupBonuses: '++id, cardId, cardTemplateId, completed',
  perks: '++id, cardId, perkTemplateId, used, currentPeriodEnd',
});

// Expose to window for BDD testing
if (typeof window !== 'undefined') {
  (window as unknown as { db: typeof db }).db = db;
}

export { db };
