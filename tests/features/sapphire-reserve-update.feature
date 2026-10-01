Feature: Current Chase Sapphire Reserve benefits
  As a cardholder I want the catalog and my tracked perks to reflect current benefits

  Scenario: Catalog shows the October 2026 DoorDash benefits and current offer
    Given I am on the "Catalog" page
    When I click on the card "Chase Sapphire Reserve"
    Then I should see "$15 DoorDash Credit" perk
    And I should not see "$5 DoorDash Restaurant Credit" perk
    And I should see "any qualifying DoorDash order"
    And I should see "100,000" as the bonus amount
    And the "Chase Sapphire Reserve" catalog perks should have these terms:
      | id                     | annualValue | periodValue | renewalPeriod | expirationDate |
      | csr-restaurant-doordash | 180         | 15          | monthly       | 2029-12-31     |
      | csr-grocery-doordash-1  | 120         | 10          | monthly       | 2029-12-31     |
      | csr-grocery-doordash-2  | 120         | 10          | monthly       | 2029-12-31     |
      | csr-dashpass           | 120         |             | annual        | 2029-12-31     |
      | csr-select-hotel       | 250         |             | annual        | 2026-12-31     |

  Scenario Outline: Existing unused DoorDash perk updates without losing activation or creating duplicates
    Given I have added the "Chase Sapphire Reserve" card
    And my tracked DoorDash perk has the old five-dollar terms with activation "<active>"
    When the app syncs catalog perks
    And I view the card detail for "Chase Sapphire Reserve"
    Then I should see "$15 DoorDash Credit" in the perks list
    And I should not see "$5 DoorDash Restaurant Credit" in the perks list
    And my tracked DoorDash perk should have value 15 and annual value 180 with activation "<active>"
    And the "$15 DoorDash Credit" perk should expire on "the end of the current month"

    Examples:
      | active |
      | true   |
      | false  |

  Scenario: Used DoorDash perk retains history until monthly renewal
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    And my tracked DoorDash perk has the old five-dollar terms with activation "true"
    And I toggle the "$5 DoorDash Restaurant Credit" perk
    And the app syncs catalog perks
    Then the "$5 DoorDash Restaurant Credit" perk should be marked as used
    When the renewal period for "$5 DoorDash Restaurant Credit" expires
    And the app refreshes expired perks
    Then I should see "$15 DoorDash Credit" in the perks list
    And the "$15 DoorDash Credit" perk should not be marked as used
    And my tracked DoorDash perk should have value 15 and annual value 180 with activation "true"
