Feature: Perk Activation Persistence
  As a user I want my activated perks to stay active after renewal

  Scenario: Explicitly activated perk stays active after renewal
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    Then the "$15 DoorDash Credit" perk should have an Activate button
    When I activate the "$15 DoorDash Credit" perk
    Then the "$15 DoorDash Credit" perk should not have an Activate button
    
    When the renewal period for "$15 DoorDash Credit" expires
    And the app refreshes expired perks
    And I view the card detail for "Chase Sapphire Reserve"
    
    Then the "$15 DoorDash Credit" perk should not have an Activate button
    And the perk "$15 DoorDash Credit" active status in DB should be "true"

  Scenario: Implicitly active perk (from old version) stays active after renewal
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    Then the "$300 Travel Credit" perk should not have an Activate button
    
    When the perk "$300 Travel Credit" has active set to undefined in DB
    And the renewal period for "$300 Travel Credit" expires
    And the app refreshes expired perks
    Then the perk "$300 Travel Credit" active status in DB should be "true"
    And I view the card detail for "Chase Sapphire Reserve"
    
    Then the "$300 Travel Credit" perk should not have an Activate button
