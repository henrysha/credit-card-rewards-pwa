Feature: Bank of America Atmos Rewards cards
  Users can find and track the current Alaska Airlines Atmos Rewards credit cards.

  Scenario: Find all three cards by issuer and loyalty family
    Given I am on the "Catalog" page
    When I click the "Bank of America" filter button
    Then I should see 3 cards in the catalog
    When I click the "All" filter button
    Then the "Atmos Rewards" family should have 3 catalog cards
    And I should see "Atmos Rewards Ascent Visa Signature"
    And I should see "Atmos Rewards Summit Visa Infinite"
    And the "Atmos Rewards Visa Signature Business" catalog card should be marked as a business card

  Scenario Outline: View current card terms
    Given I am on the "Catalog" page
    When I click on the card "<card>"
    Then the card annual fee should be <fee> dollars
    And I should see "<offer>" on the detail page
    And I should see "<category>" earning rate with "<rate>"
    And I should see "<perk>" perk

    Examples:
      | card                                  | fee | offer                                         | category                                         | rate | perk                                       |
      | Atmos Rewards Ascent Visa Signature   | 95  | Spend $2,500 to earn 70,000 points in 90 days | Gas & EV Charging                                | 2x   | Annual $99 Companion Fare                  |
      | Atmos Rewards Summit Visa Infinite    | 395 | Spend $4,000 to earn 80,000 points in 90 days | Eligible Foreign Purchases                       | 3x   | Annual 25,000-Point Global Companion Award |
      | Atmos Rewards Visa Signature Business | 195 | Spend $6,000 to earn 90,000 points in 90 days | Alaska & Hawaiian Flights via Atmos for Business | 10x  | 50% Flight Discounts & Bonus Status Points |

  Scenario Outline: Consumer welcome bonuses link to the verified issuer campaign
    Given I am on the "Catalog" page
    When I click on the card "<card>"
    Then I should see "<companion>" on the detail page
    And the catalog offer terms should link to "<terms>"

    Examples:
      | card                                | companion                                                                             | terms                                                                                                                |
      | Atmos Rewards Ascent Visa Signature | $99 Companion Fare (plus taxes and fees from $23) after meeting the spend requirement | https://www.bankofamerica.com/credit-cards/terms-and-conditions/?campaignid=4081060&productoffercode=RS&locale=en_US |
      | Atmos Rewards Summit Visa Infinite  | 25,000-point Global Companion Award after meeting the spend requirement               | https://www.bankofamerica.com/credit-cards/terms-and-conditions/?campaignid=4081112&productoffercode=S2&locale=en_US |

  Scenario: Save the Summit welcome award and track the 90-day deadline
    Given I have added the "Atmos Rewards Summit Visa Infinite" card
    Then I should see "Plus: 25,000-point Global Companion Award after meeting the spend requirement" on the detail page
    When I open the card details editor
    And I enter "2021-02-01" as the card opening date
    And I click "Save Changes"
    Then the card should display opening date "2021-02-01"
    When I reload the page
    Then I should see "Plus: 25,000-point Global Companion Award after meeting the spend requirement" on the detail page
    When I open the bonus deadline editor
    Then the bonus deadline input should contain "2021-05-02"

  Scenario: The Business card keeps the revised benefits after adding it
    Given I have added the "Atmos Rewards Visa Signature Business" card
    Then I should see "4 Alaska Lounge Passes" in the perks list
    And the "$120 Global Entry/TSA PreCheck" perk should show 120 dollars per "4yr"
    And the saved welcome bonus should have no additional tier
    And I should not see "Annual $99 Companion Fare" perk

  Scenario Outline: The Perks list labels the full four-year credit
    Given I have added the "<card>" card
    When I navigate to the "Perks"
    Then the "$120 Global Entry/TSA PreCheck" perk should show 120 dollars per "4yr"
    When the saved "$120 Global Entry/TSA PreCheck" perk is inactive
    And I click the "Inactive" filter button
    Then the "$120 Global Entry/TSA PreCheck" perk should show 120 dollars per "4yr"

    Examples:
      | card                                  |
      | Atmos Rewards Summit Visa Infinite    |
      | Atmos Rewards Visa Signature Business |

  Scenario: Shared loyalty branding does not allow converting a personal card to a business card
    Given I have added the "Atmos Rewards Ascent Visa Signature" card
    When I attempt a direct product change to "Atmos Rewards Visa Signature Business"
    Then the direct product change should be rejected without mutating the account
