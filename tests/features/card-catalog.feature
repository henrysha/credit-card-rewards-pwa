Feature: Card Catalog
  As a user I want to browse available credit cards and filter them

  Scenario: View all cards in the catalog
    Given I open the app
    When I navigate to the "Catalog"
    Then I should see 30 cards in the catalog

  Scenario: Filter cards by issuer
    Given I am on the "Catalog" page
    When I click the "Chase" filter button
    Then I should see 9 cards in the catalog
    And I should see "Chase Sapphire Preferred"
    And I should see "Chase Sapphire Reserve"
    And I should see "Chase Freedom Flex"
    And I should see "Chase Freedom"

  Scenario: Filter cards by Amex issuer
    Given I am on the "Catalog" page
    When I click the "Amex" filter button
    Then I should see 9 cards in the catalog

  Scenario: Robinhood Gold Card is present and filterable
    Given I am on the "Catalog" page
    When I click the "Robinhood" filter button
    Then I should see 1 cards in the catalog
    And I should see "Robinhood Gold Card"

  Scenario: Robinhood Gold Card shows current eligibility and fee terms
    Given I am on the "Catalog" page
    When I click on the card "Robinhood Gold Card"
    Then I should see "Robinhood Gold Card"
    And I should see "Annual Robinhood Gold subscription"
    And I should see "No 30-day free trial"
    And I should not see "Robinhood Gold Membership Required" perk
    And I should see "All Other Eligible Purchases (including Travel Portal)" earning rate with "3x"
    And I should not see "Robinhood Travel Portal (select purchases)" earning rate

  Scenario: Search cards by name
    Given I am on the "Catalog" page
    When I search for "Venture"
    Then I should see "Capital One Venture"
    And I should see "Capital One Venture X"
    And I should not see "Chase Sapphire"

  Scenario: View card details and perks from the catalog
    Given I am on the "Catalog" page
    When I click on the card "Chase Sapphire Preferred"
    Then I should see "Chase Sapphire Preferred"
    And I should see "Sign-up Bonus"
    And I should see "Earning Rates"
    And I should see "Credits"
    And I should see "DashPass Membership" perk

  Scenario: View Chase Freedom Flex details and perks from the catalog
    Given I am on the "Catalog" page
    When I click on the card "Chase Freedom Flex"
    Then I should see "Chase Freedom Flex"
    And I should see "Sign-up Bonus"
    And I should see "Earning Rates"
    And I should see "Cell Phone Protection" perk
    And I should see "DashPass 3-Month Trial" perk

  Scenario: View updated perks for redesigned Chase Sapphire Preferred
    Given I am on the "Catalog" page
    When I click on the card "Chase Sapphire Preferred"
    Then I should see "$100 Hotel Credit" perk
    And I should see "$120 Global Entry/TSA PreCheck" perk
    And I should see "Apple TV+ Subscription" perk
    And I should see "Emergency Evacuation & Transportation" perk
    And I should not see "$50 Hotel Credit" perk
    And I should not see "10% Anniversary Points Bonus" perk
