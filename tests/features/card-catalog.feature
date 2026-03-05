Feature: Card Catalog
  As a user I want to browse available credit cards and filter them

  Scenario: View all cards in the catalog
    Given I open the app
    When I navigate to the "Catalog"
    Then I should see 15 cards in the catalog

  Scenario: Filter cards by issuer
    Given I am on the "Catalog" page
    When I click the "Chase" filter button
    Then I should see 5 cards in the catalog
    And I should see "Chase Sapphire Preferred"
    And I should see "Chase Sapphire Reserve"

  Scenario: Filter cards by Amex issuer
    Given I am on the "Catalog" page
    When I click the "Amex" filter button
    Then I should see 5 cards in the catalog

  Scenario: Search cards by name
    Given I am on the "Catalog" page
    When I search for "Venture"
    Then I should see "Capital One Venture"
    And I should see "Capital One Venture X"
    And I should not see "Chase Sapphire"
