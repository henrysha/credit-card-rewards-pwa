Feature: Automatic annual fee date rollover
  Scenario Outline: Refresh saved fee dates when opening the app
    Given the rewards date is "<today>"
    And a saved "<status>" card has annual fee date "<original>"
    When I reload the page
    Then the saved annual fee date should be "<expected>"
    When I reload the page
    Then the saved annual fee date should be "<expected>"

    Examples:
      | today      | status          | original   | expected   |
      | 2026-10-01 | active          | 2026-09-30 | 2027-09-30 |
      | 2026-10-01 | active          | 2026-10-01 | 2026-10-01 |
      | 2026-10-01 | active          | 2026-10-02 | 2026-10-02 |
      | 2026-10-01 | active          | 2022-12-15 | 2026-12-15 |
      | 2026-10-01 | active          | 2022-09-15 | 2027-09-15 |
      | 2025-02-28 | active          | 2024-02-29 | 2025-02-28 |
      | 2028-01-01 | active          | 2024-02-29 | 2028-02-29 |
      | 2026-10-01 | closed          | 2025-09-30 | 2025-09-30 |
      | 2026-10-01 | product-changed | 2025-09-30 | 2025-09-30 |

  Scenario Outline: Rollover follows the local date rather than UTC
    Given the annual fee calendar uses "<timezone>" at "<instant>"
    And a saved "active" card has annual fee date "2026-09-30"
    When I reload the page
    Then the saved annual fee date should be "<expected>"

    Examples:
      | timezone           | instant              | expected   |
      | America/New_York   | 2026-10-01T02:00:00Z | 2026-09-30 |
      | Pacific/Kiritimati | 2026-09-30T12:00:00Z | 2027-09-30 |

  Scenario: Fee date rolls over when the PWA resumes after several years
    Given the rewards date is "2026-09-30"
    And a saved "active" card has annual fee date "2026-09-30"
    When I navigate to the detail page for "Chase Sapphire Reserve"
    Then the next annual fee should display "2026-09-30"
    When the PWA resumes on "2029-10-01"
    Then the next annual fee should display "2030-09-30"
    And the saved annual fee date should be "2030-09-30"
    And the annual fee should have no urgency indicator

  Scenario: Fee date rolls over at local midnight while the app remains open
    Given the rewards clock starts just before the quarter ends
    And a saved "active" card has annual fee date "2026-12-31"
    When I navigate to the detail page for "Chase Sapphire Reserve"
    Then the next annual fee should display "2026-12-31"
    When the rewards clock passes midnight
    Then the next annual fee should display "2027-12-31"
    And the saved annual fee date should be "2027-12-31"
    And the annual fee should have no urgency indicator
