Feature: Perk Management
  As a user I want to track which perks I have used

  Scenario: View perks on card detail
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    Then I should see "$300 Travel Credit" in the perks list
    And I should see "$500 \"The Edit\" Hotel Credit" in the perks list
    And I should see an unclaimed value badge

  Scenario: Toggle a perk as used
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    And I toggle the "$300 Travel Credit" perk
    Then the "$300 Travel Credit" perk should be marked as used

  Scenario: Perk state persists after navigation
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    And I toggle the "$300 Travel Credit" perk
    And I navigate to the "Dashboard"
    And I view the card detail for "Chase Sapphire Reserve"
    Then the "$300 Travel Credit" perk should be marked as used

  Scenario: Perks page shows aggregated perks
    Given I have added the "Chase Sapphire Reserve" card
    When I navigate to the "Perks"
    Then I should see "$300 Travel Credit" on the perks page
    And I should see an unclaimed total value

  Scenario: Perk resets to unused after renewal period expires
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    And I toggle the "$120 Lyft Credit" perk
    Then the "$120 Lyft Credit" perk should be marked as used
    When the renewal period for "$120 Lyft Credit" expires
    And the app refreshes expired perks
    And I view the card detail for "Chase Sapphire Reserve"
    Then the "$120 Lyft Credit" perk should not be marked as used
