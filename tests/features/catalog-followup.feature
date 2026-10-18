Feature: Reverified October 18 catalog follow-up
  Updated issuer terms retain their restrictions in catalog details and saved cards.

  Background:
    Given the perk calendar uses "America/New_York" at "2026-10-18T17:00:00Z"

  Scenario Outline: Updated benefits show their issuer restrictions
    Given I am on the "Catalog" page
    When I click on the card "<card>"
    Then I should see "<perk>" perk
    And the "<perk>" perk description should mention "<restriction>"

    Examples:
      | card                                              | perk                                     | restriction                        |
      | Chase Freedom Flex                                | No Foreign Transaction Fees              | Sept 2026                          |
      | Chase Ink Business Preferred                       | $10 Monthly DoorDash Grocery Credit      | while enrolled                     |
      | United Club Card                                  | IHG One Rewards Platinum Elite Status    | after registration                 |
      | United Club Card                                  | Avis President's Club Enrollment         | eligible to enroll                 |
      | IHG One Rewards Credit Card                       | 4th Night Free                           | $5,000 in calendar-year            |
      | IHG One Rewards Credit Card                       | 5 Elite Night Credits                    | each calendar year                 |
      | IHG One Rewards Credit Card                       | Gold Elite + 10,000 Bonus Points          | $15,000 in calendar-year            |
      | IHG One Rewards Credit Card                       | 30% IHG Points Purchase Discount          | 30%                                |
      | Capital One Venture                               | $300 Capital One Travel \"Stays\" Credit   | hotel and vacation rental          |
      | Capital One Venture                               | Lifestyle Collection $50 Experience Credit | per stay                         |
      | Capital One Venture X                             | $800 Cell Phone Protection               | deductible                         |
      | Capital One Venture X                             | Premier Collection $100 Experience Credit | per stay                          |
      | Capital One Venture X                             | Lifestyle Collection $50 Experience Credit | per stay                         |
      | Robinhood Gold Card                               | Foreign Transaction Fee Terms            | on or after 2026-07-01             |
      | Robinhood Gold Card                               | DashPass 6-Month Trial                    | auto-renews                        |
      | Robinhood Gold Card                               | In-App Dining Merchant Offers            | Individual Offer Terms             |
      | Bilt Blue Card                                    | Flexible Bilt Cash                       | Choose the Flexible Bilt Cash option |
      | Bilt Obsidian Card                                | Bilt Point Accelerator                   | up to five activations             |
      | Citi® / AAdvantage® Globe™ Mastercard®             | Flight Streak Bonus                      | per status qualification year      |
      | Citi® / AAdvantage® Globe™ Mastercard®             | Companion Certificate                    | second cardmembership year         |

  Scenario Outline: Current Apple subscription values are shown
    Given I am on the "Catalog" page
    When I click on the card "<card>"
    Then the "<perk>" perk should show <value> dollars

    Examples:
      | card                     | perk                    | value |
      | Chase Sapphire Preferred | Apple TV+ Subscription  | 180   |
      | Chase Sapphire Reserve   | Apple TV+ & Apple Music | 324   |

  Scenario Outline: Freedom Lyft rewards retain the promotion end date
    Given I am on the "Catalog" page
    When I click on the card "<card>"
    Then I should see "Lyft" earning rate with "2x"
    And the "Lyft" earning rate limit should mention "9/30/2027"

    Examples:
      | card                    |
      | Chase Freedom           |
      | Chase Freedom Unlimited |

  Scenario: Preferred Peloton rate states the purchase cap
    Given I am on the "Catalog" page
    When I click on the card "Chase Sapphire Preferred"
    Then I should see "Peloton" earning rate with "5x"
    And the "Peloton" earning rate limit should mention "$5,000"
    And the "Peloton" earning rate limit should mention "12/31/2027"

  Scenario: Renamed IHG card keeps its identifier and current welcome offer
    Given I am on the "Catalog" page
    When I click on the card "IHG One Rewards Credit Card"
    Then the catalog detail URL should end with "catalog/chase-ihg-traveler"
    And I should see "Spend $2,000 to earn 125,000 points" on the detail page
    And I should see "Additional 10,000 points after adding an authorized user" on the detail page
    And I should see "Dining, Grocery Stores & Gas Stations" earning rate with "3x"
    And the "Utilities, Internet, Cable, Phone & Select Streaming" earning rate limit should mention "2x from 2027"

  Scenario: IHG Premier shows the temporary broader travel earning category
    Given I am on the "Catalog" page
    When I click on the card "IHG One Rewards Premier Credit Card"
    Then I should see "Other Travel" earning rate with "5x"
    And the "Other Travel" earning rate limit should mention "3x from 2027"

  Scenario Outline: Capital One Entertainment is distinct from travel earnings
    Given I am on the "Catalog" page
    When I click on the card "<card>"
    Then I should see "Capital One Entertainment" earning rate with "5x"

    Examples:
      | card                  |
      | Capital One Venture   |
      | Capital One Venture X |

  Scenario: Apple channel-specific offers are alternatives, not additive
    Given I am on the "Catalog" page
    When I click on the card "Apple Card"
    Then I should see "one acquisition offer per account" on the detail page
    And I should see "it cannot be combined with the $100 offer" on the detail page
    When I click "Add This Card"
    Then I should see "Spend $100 to earn 100 cash back" on the detail page
    And the saved welcome bonus should have no additional tier

  Scenario: Blue Business Plus advertises a personalized maximum instead of zero points
    Given I am on the "Catalog" page
    When I click on the card "Amex Blue Business® Plus"
    Then I should see "the advertised maximum is not guaranteed" on the detail page
    And I should see "Spend $5,000 to earn 50,000 points (up to; personalized offer)" on the detail page
    When I click "Add This Card"
    Then I should see "Spend $5,000 to earn 50,000 points (up to; personalized offer)" on the detail page

  Scenario: Citi Executive fee, offer and credits match the refreshed product
    Given I am on the "Catalog" page
    When I click on the card "Citi® / AAdvantage® Executive World Legend Mastercard®"
    Then the card annual fee should be 695 dollars
    And I should see "Spend $15,000 to earn 125,000 miles" on the detail page
    And I should see "in 5 months" on the detail page
    And I should see "Car Rentals & Hotels (AA)" earning rate with "12x"
    And the "Up to $500 AA Vacations Credits" perk should show 250 dollars per "6mo"
    And the "Up to $180 Lyft Credits" perk should show 15 dollars per "mo"
    And the "Up to $180 Lyft Credits" perk description should mention "after 3 eligible Lyft rides"
    And I should see "Omni Hotels Champion Status" perk
    And the "Loyalty Point Milestone Bonuses" perk description should mention "per status qualification year"

  Scenario Outline: Citi application and welcome eligibility restrictions remain visible
    Given I am on the "Catalog" page
    When I click on the card "<card>"
    Then I should see "<restriction>" on the detail page

    Examples:
      | card                | restriction                                        |
      | Citi Custom Cash    | Closed to new applicants as of 5/28/2026            |
      | Citi Strata Premier | ineligible if you currently hold or ever held       |

  Scenario: Surpass first-year fee waiver is part of the catalog contract
    Given I am on the "Catalog" page
    When I click on the card "Hilton Honors American Express Surpass Card"
    Then the catalog card should waive its first-year annual fee
    And I should see "first year; $150 thereafter" on the detail page

  Scenario: United Club status benefits require enrollment before tracking them as active
    Given I have added the "United Club Card" card
    Then the perk "IHG One Rewards Platinum Elite Status" active status in DB should be "false"
    And the perk "Avis President's Club Enrollment" active status in DB should be "false"
    When I activate the "IHG One Rewards Platinum Elite Status" perk
    Then the perk "IHG One Rewards Platinum Elite Status" active status in DB should be "true"
