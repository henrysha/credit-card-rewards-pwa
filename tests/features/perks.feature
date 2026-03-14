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

  Scenario: Perks update on catalog change
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    Then I should see "$300 Travel Credit" in the perks list
    
    When the master catalog's "$300 Travel Credit" is renamed to "$300 Ultimate Travel Credit"
    And a "$50 Fake Credit" perk is added to the "Chase Sapphire Reserve" catalog template
    And the app syncs catalog perks
    
    Then I should see "$300 Ultimate Travel Credit" in the perks list
    And I should see "$50 Fake Credit" in the perks list
    But I should not see "$300 Travel Credit" in the perks list

  Scenario: Used perk retains original details until refreshed
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    And I toggle the "$300 Travel Credit" perk
    Then the "$300 Travel Credit" perk should be marked as used
    
    When the master catalog's "$300 Travel Credit" is renamed to "$300 Ultimate Travel Credit"
    And the app syncs catalog perks
    
    Then I should see "$300 Travel Credit" in the perks list
    And the "$300 Travel Credit" perk should be marked as used
    But I should not see "$300 Ultimate Travel Credit" in the perks list
    
    When a perk "$300 Travel Credit" is set to expire in -1 days
    And the app refreshes expired perks
    
    Then I should see "$300 Ultimate Travel Credit" in the perks list
    And the "$300 Ultimate Travel Credit" perk should not be marked as used
    But I should not see "$300 Travel Credit" in the perks list

  Scenario: View perk details via info icon
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    And I click the info icon for the "$300 Exclusive Tables Dining" perk
    Then I should see the perk details modal for "$300 Exclusive Tables Dining"
    And I should see "CSR Dining credit can only be used at Opentable exclusive tables restaurants." in the modal
    And I should see a link to "https://opentable.com/sapphire-reserve-exclusive-tables" in the modal
    When I click the close button on the perk details modal
    Then the perk details modal should be closed
