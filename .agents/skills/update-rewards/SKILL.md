---
name: update-rewards
description: How to update credit card rewards data in the PWA
---

# Update Credit Card Rewards Data

This skill guides you through updating the credit card rewards data used by the PWA.

## When to Use
- When card issuers announce new/changed perks or benefits
- When sign-up bonus offers change
- When annual fees change
- Quarterly review to catch any missed updates

## Instructions

### 1. Research current rewards
Research current rewards for each card issuer:
- Chase: https://creditcards.chase.com/
- Amex: https://www.americanexpress.com/us/credit-cards/
- Capital One: https://www.capitalone.com/credit-cards/
- Citi: https://www.citi.com/credit-cards/

### 2. Compare with existing data
Compare with existing data in `src/db/seed-data.ts`:
- Check sign-up bonuses (points, spend requirements, time limits)
- Check earning rates (multipliers, category caps)
- Check perks (dollar values, renewal periods, expiration dates)
- Check annual fees

### 3. Update `src/db/seed-data.ts`
Update `src/db/seed-data.ts` with any changes found:
- Update the relevant `CardTemplate` object
- Update perk values, descriptions, and expiration dates
- Add new perks or remove discontinued ones

### 4. Verify the build
Verify the build passes:
```bash
npm run build
```

### 5. Test locally
Test locally to ensure no data issues:
```bash
npm run dev
```

### 6. Commit changes
Commit changes with a descriptive message:
```bash
git add src/db/seed-data.ts
git commit -m "chore: update rewards data — [describe changes]"
```
