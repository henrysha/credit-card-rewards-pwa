import Dexie, { type EntityTable } from 'dexie';
import type { UserCard, SignupBonus, UserPerk } from './types';

const db = new Dexie('CreditCardRewardsDB') as Dexie & {
  cards: EntityTable<UserCard, 'id'>;
  signupBonuses: EntityTable<SignupBonus, 'id'>;
  perks: EntityTable<UserPerk, 'id'>;
};

db.version(1).stores({
  cards: '++id, cardTemplateId, status, openedDate',
  signupBonuses: '++id, cardId, cardTemplateId, completed',
  perks: '++id, cardId, perkTemplateId, used, currentPeriodEnd',
});

export { db };
