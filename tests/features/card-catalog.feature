Feature: Card Catalog
  As a user I want to browse available credit cards and filter them

  Scenario: View all cards in the catalog
    Given I open the app
    When I navigate to the "Catalog"
    Then I should see 32 cards in the catalog

  Scenario: SKYPASS consumer cards are listed and filterable
    Given I am on the "Catalog" page
    When I click the "U.S. Bank" filter button
    Then I should see 3 cards in the catalog
    And I should see "SKYPASS SkyBlue Visa"
    And I should see "SKYPASS Visa Signature"
    And I should see "SKYPASS Select Visa Signature"
    And I should not see "SKYPASS Visa Signature Business"

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
