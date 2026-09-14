Feature: Actual quarterly rotating categories
  Scenario Outline: Show the current quarter's categories on Freedom cards
    Given the rewards date is "2026-09-14"
    And I have added the "<card>" card
    When I view the card detail for "<card>"
    Then the quarterly earning rates should show "Q3 2026: Gas Stations, Public Transit, EV Charging, Select Live Entertainment, United Way"
    And the quarterly earning rates should show "Activate by 2026-09-14"
    When I navigate to the "Dashboard"
    Then I should see "Gas" in the best card section with "<card>" and "5x" multiplier
    And I should see "Public Transit" in the best card section with "<card>" and "5x" multiplier
    And I should see "Streaming" in the best card section with "<card>" and "1x" multiplier

    Examples:
      | card               |
      | Chase Freedom      |
      | Chase Freedom Flex |

  Scenario: Missing quarter does not reuse expired categories
    Given the rewards date is "2026-10-01"
    And I have added the "Chase Freedom" card
    When I view the card detail for "Chase Freedom"
    Then the quarterly earning rates should show "Current quarter categories not available."
    When I navigate to the "Dashboard"
    Then I should see "Gas" in the best card section with "Chase Freedom" and "1x" multiplier

  Scenario: Freedom Unlimited has no quarterly category schedule
    Given I have added the "Chase Freedom Unlimited" card
    When I view the card detail for "Chase Freedom Unlimited"
    Then no quarterly category schedule should be displayed

  Scenario: Quarter boundaries and scoped rewards are accurate
    Then quarterly reward date boundaries and recommendations should be accurate
