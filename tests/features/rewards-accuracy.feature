Feature: Rewards Accuracy
  As a user I want to see accurate reward multipliers for granular categories

  Background:
    Given I open the app

  Scenario: Granular travel rewards mapping for Chase Sapphire Preferred
    Given I have added the "Chase Sapphire Preferred" card
    When I navigate to the "Dashboard"
    Then I should see "Travel Portal" in the best card section with "Chase Sapphire Preferred" and "5x" multiplier
    And I should see "Flights" in the best card section with "Chase Sapphire Preferred" and "2x" multiplier
    And I should see "Hotels" in the best card section with "Chase Sapphire Preferred" and "2x" multiplier
    And I should see "Rental Cars" in the best card section with "Chase Sapphire Preferred" and "2x" multiplier

  Scenario: Online vs Physical Grocery distinction
    Given I have added the "Chase Sapphire Preferred" card
    When I navigate to the "Dashboard"
    Then I should see "Online Groceries" in the best card section with "Chase Sapphire Preferred" and "3x" multiplier
    And I should not see "Groceries" in the best card section with "Chase Sapphire Preferred" and "3x" multiplier

  Scenario: Multi-card best card selection
    Given I have added the "Chase Sapphire Preferred" card
    And I have added the "American Express Gold" card
    When I navigate to the "Dashboard"
    Then I should see "Groceries" in the best card section with "American Express Gold" and "4x" multiplier
    And I should see "Dining" in the best card section with "American Express Gold" and "4x" multiplier
    And I should see "Travel Portal" in the best card section with "Chase Sapphire Preferred" and "5x" multiplier
    And I should see "Flights" in the best card section with "American Express Gold" and "3x" multiplier

  Scenario: Chase Sapphire Reserve portal vs direct
    Given I have added the "Chase Sapphire Reserve" card
    When I navigate to the "Dashboard"
    Then I should see "Travel Portal" in the best card section with "Chase Sapphire Reserve" and "8x" multiplier
    And I should see "Flights" in the best card section with "Chase Sapphire Reserve" and "4x" multiplier
    And I should see "Hotels" in the best card section with "Chase Sapphire Reserve" and "4x" multiplier

  Scenario: Lyft vendor subcategory under Transit & Rideshare
    Given I have added the "Chase Sapphire Preferred" card
    When I navigate to the "Dashboard"
    Then I should see "Transit & Rideshare" on the dashboard
    When I click to expand the "Transit & Rideshare" category
    Then I should see the "Lyft" subcategory

  Scenario: Everything Else shows highest catch-all card (issue #48)
    Given I have added the "Capital One Venture" card
    And I have added the "Chase Ink Business Preferred" card
    When I navigate to the "Dashboard"
    Then I should see "Everything Else" in the best card section with "Capital One Venture" and "2x" multiplier
