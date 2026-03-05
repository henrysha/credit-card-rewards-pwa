Feature: Dashboard
  As a user I want to see an overview of my credit card rewards status

  Scenario: Empty dashboard when no cards added
    Given I open the app
    Then I should see "No cards added yet"
    And I should see "0" as the active cards count
    And I should see "$0" as the unused perks value

  Scenario: Dashboard updates after adding a card
    Given I have added the "Chase Sapphire Reserve" card
    When I navigate to the "Dashboard"
    Then I should see "1" as the active cards count
    And the unused perks value should be greater than "$0"
    And I should see "Unused Perks This Period"

  Scenario: Dashboard shows active signup bonus
    Given I have added the "Chase Sapphire Reserve" card
    When I navigate to the "Dashboard"
    Then I should see "Active Sign-up Bonuses" on the dashboard
    And I should see "125K points" bonus info
