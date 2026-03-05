Feature: Remove Card
  As a user I want to remove cards from my wallet

  Scenario: Remove a card from card detail
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    And I click "Remove Card"
    And I confirm the removal
    Then I should be on the cards page
    And I should not see "Chase Sapphire Reserve"

  Scenario: Removing a card clears perks and bonus
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    And I click "Remove Card"
    And I confirm the removal
    And I navigate to the "Perks"
    Then I should see no perks listed
