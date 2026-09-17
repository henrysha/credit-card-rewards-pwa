Feature: Actual quarterly rotating categories
  Scenario Outline: Show the current quarter's categories on Freedom cards
    Given the rewards date is "2026-09-14"
    And I have added the "<card>" card
    When I view the card detail for "<card>"
    Then the rotating rewards section should show the published current quarter categories
    And each quarterly category should have its own 5x earning row
    And the quarterly earning rates should show "Q3 2026"
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
    Given the rewards date is "2027-01-01"
    And I have added the "Chase Freedom" card
    When I view the card detail for "Chase Freedom"
    Then the rotating rewards section should have no published categories
    And the quarterly earning rates should show "Current quarter categories not available."
    When I navigate to the "Dashboard"
    Then I should see "Gas" in the best card section with "Chase Freedom" and "1x" multiplier

  Scenario: Freedom Unlimited has no quarterly category schedule
    Given I have added the "Chase Freedom Unlimited" card
    When I view the card detail for "Chase Freedom Unlimited"
    Then no quarterly category schedule should be displayed

  Scenario: Quarter boundaries and scoped rewards are accurate
    Then quarterly reward date boundaries and recommendations should be accurate

  Scenario: Category details refresh when the PWA resumes in a new quarter
    Given the rewards date is "2026-09-30"
    And I have added the "Chase Freedom" card
    When I view the card detail for "Chase Freedom"
    Then the quarterly earning rates should show "Q3 2026"
    When the PWA resumes on "2027-01-01"
    Then the rotating rewards section should have no published categories
    And the quarterly earning rates should show "Current quarter categories not available."

  Scenario: Dashboard recommendations refresh on resume without navigation
    Given the rewards date is "2026-09-30"
    And I have added the "Chase Freedom" card
    When I navigate to the "Dashboard"
    Then I should see "Gas" in the best card section with "Chase Freedom" and "5x" multiplier
    When the PWA resumes on "2026-10-01"
    Then I should see "Gas" in the best card section with "Chase Freedom" and "1x" multiplier

  Scenario: Category details refresh at midnight while the app stays open
    Given the rewards clock starts just before the quarter ends
    And I have added the "Chase Freedom" card
    When I view the card detail for "Chase Freedom"
    Then the quarterly earning rates should show "Q4 2026"
    When the rewards clock passes midnight
    Then the rotating rewards section should have no published categories
    And the quarterly earning rates should show "Current quarter categories not available."

  Scenario: Expired perk usage refreshes on resume
    Given the rewards date is "2026-09-30"
    And I have added the "American Express Platinum" card
    When I view the card detail for "American Express Platinum"
    And I activate the "$400 Resy Credit" perk
    And I toggle the "$400 Resy Credit" perk
    Then the "$400 Resy Credit" perk should be marked as used
    When the PWA resumes on "2026-10-01"
    Then the "$400 Resy Credit" perk should not be marked as used
    And the "$400 Resy Credit" perk should have a Deactivate button


  Scenario: Quarterly recommendations remain readable on a narrow phone
    Given the rewards date is "2026-09-14"
    And the rewards viewport is a narrow phone
    And I have added the "Chase Freedom" card
    When I navigate to the "Dashboard"
    Then each quarterly recommendation should have readable category, card, and multiplier columns
    And quarterly recommendation terms should appear once outside the rows

  Scenario: Published categories remain visible alongside manually saved categories
    Given the rewards date is "2026-09-14"
    And I have added the "Chase Freedom" card
    When I view the card detail for "Chase Freedom"
    And I add a current quarter reward for "PayPal" with "7x" multiplier
    Then the rotating rewards section should show the published current quarter categories
    And I should see "PayPal" in the rotating rewards section

  Scenario Outline: Published next quarter categories are scheduled without manual entry
    Given the rewards date is "2026-09-17"
    And I have added the "<card>" card
    When I view the card detail for "<card>"
    Then the published "next" quarter should show Q4 categories with "<dining>" dining multiplier
    And the quarterly earning rates should show "Q3 2026"
    When I reload the page
    Then the published "next" quarter should show Q4 categories with "<dining>" dining multiplier
    When the PWA resumes on "2026-10-01"
    Then the published "current" quarter should show Q4 categories with "<dining>" dining multiplier
    And the quarterly earning rates should show "Q4 2026"
    When I reload the page
    Then the published "current" quarter should show Q4 categories with "<dining>" dining multiplier
    When I navigate to the "Dashboard"
    Then I should see "Dining" in the best card section with "<card>" and "<dining>" multiplier
    And I should see "Groceries" in the best card section with "<card>" and "5x" multiplier
    And I should see "Gas" in the best card section with "<card>" and "1x" multiplier

    Examples:
      | card               | dining |
      | Chase Freedom      | 5x     |
      | Chase Freedom Flex | 7x     |
