Feature: Bank of America Atmos churning rules

  Scenario: The Churning page identifies published offer terms and reported approval limits
    Given I open the app
    When I am on the "Churning" page
    Then I should see "Atmos Ascent Previous Cardholder Rule" rule
    And I should see "Atmos Summit Welcome Offer" rule
    And I should see "Atmos Business Application and Welcome Offer" rule
    And I should see "Reported 2/3/4 Approval Limits" rule
    And the Bank of America section should link to the three issuer offers and the reported approval limits

  Scenario Outline: Ascent availability uses the last day held
    Given the churning date is "<today>"
    And my card history includes an Atmos Ascent opened "2020-01-01" and closed "<closed>"
    When I am on the "Churning" page
    Then I should see "<status>" for Bank of America
    When I check bonus eligibility for "Atmos Rewards Ascent Visa Signature"
    Then the tracked offer eligibility should be "<eligibility>"

    Examples:
      | today      | closed     | status                           | eligibility |
      | 2026-11-26 | 2024-11-27 | Ascent lookback ends Nov 27, 2026 | restricted  |
      | 2026-11-27 | 2024-11-27 | No Ascent hold in the lookback    | clear       |
      | 2026-11-28 | 2024-11-27 | No Ascent hold in the lookback    | clear       |
      | 2026-02-27 | 2024-02-29 | Ascent lookback ends Feb 28, 2026 | restricted  |
      | 2026-02-28 | 2024-02-29 | No Ascent hold in the lookback    | clear       |
      | 2026-11-27 | unknown    | Ascent closure date needed       | restricted  |

  Scenario: Holding Ascent restricts Ascent even when opened long ago
    Given the churning date is "2026-11-27"
    And my card history includes an Atmos Ascent opened "2020-01-01" and closed "still active"
    When I am on the "Churning" page
    Then I should see "Ascent currently held" for Bank of America
    When I check bonus eligibility for "Atmos Rewards Ascent Visa Signature"
    Then the tracked offer eligibility should be "restricted"
    When I check bonus eligibility for "Atmos Rewards Summit Visa Infinite"
    Then the tracked offer eligibility should be "clear"
    When I check bonus eligibility for "Atmos Rewards Visa Signature Business"
    Then the tracked offer eligibility should be "clear"

  Scenario: Other tracked Bank of America cards do not trigger the Ascent lookback
    Given I have added the "Atmos Rewards Summit Visa Infinite" card
    And I have added the "Atmos Rewards Visa Signature Business" card
    When I am on the "Churning" page
    Then I should see "No Ascent hold in the lookback" for Bank of America
    And I should see "2/3/4" for Bank of America
    When I check bonus eligibility for "Atmos Rewards Ascent Visa Signature"
    Then the tracked offer eligibility should be "clear"
    When I check bonus eligibility for "Atmos Rewards Summit Visa Infinite"
    Then the tracked offer eligibility should be "clear"

  Scenario: Closing a card retains its history and opening count
    Given the churning date is "2026-11-27"
    And I have added the "Atmos Rewards Ascent Visa Signature" card
    When I open the card details editor
    And I enter "2025-01-01" as the card opening date
    And I click "Save Changes"
    Then the card should display opening date "2025-01-01"
    When I open the Mark Closed dialog
    And I enter "2024-12-31" as the closure date
    Then saving the closure date should be disabled
    When I enter "2026-11-28" as the closure date
    Then saving the closure date should be disabled
    When I enter "2025-03-04" as the closure date
    And I confirm marking the card closed
    Then I should see "Closed on 2025-03-04" on the detail page
    And the card's bonus and perks should still be in wallet history
    When I am on the "Cards" page
    Then I should see "closed" in the closed cards section
    When I am on the "Dashboard" page
    Then the dashboard should show no active bonus or perk tracking
    When I am on the "Churning" page
    Then I should see "1/5" as the 5/24 count
    And I should see "Ascent lookback ends Mar 4, 2027" for Bank of America

  Scenario: Canceling closure keeps Remove Card available
    Given I have added the "Atmos Rewards Ascent Visa Signature" card
    When I open the Mark Closed dialog
    And I click "Cancel"
    Then I should see "Mark Closed" on the detail page
    When I click "Remove Card"
    And I confirm the removal
    Then I should be on the cards page
    And I should not see "Atmos Rewards Ascent Visa Signature"

  Scenario: Opening and closing use the Eastern calendar after UTC rolls over
    Given the churning calendar uses "America/New_York" at "2026-11-28T01:00:00Z"
    And I have added the "Atmos Rewards Ascent Visa Signature" card
    Then the card should display opening date "2026-11-27"
    When I open the card details editor
    And I enter "2026-11-28" as the card opening date
    Then saving the opening date should be disabled
    When I click "Cancel"
    And I am on the "Churning" page
    Then I should see "Ascent currently held" for Bank of America
    When I view the card detail for "Atmos Rewards Ascent Visa Signature"
    And I open the Mark Closed dialog
    Then the closure date input should show "2026-11-27"
    When I confirm marking the card closed
    Then I should see "Closed on 2026-11-27" on the detail page
    When I am on the "Churning" page
    Then I should see "Ascent lookback ends Nov 27, 2028" for Bank of America

  Scenario Outline: A closed card's imported date can be corrected and survives reload
    Given the churning date is "2026-11-27"
    And my card history includes an Atmos Ascent opened "2020-01-01" and closed "<imported date>"
    When I am on the "Churning" page
    Then I should see "Ascent closure date needed" for Bank of America
    When I view the card detail for "Atmos Rewards Ascent Visa Signature"
    And I click "Edit Closure Date"
    Then the closure date input should show ""
    When I enter "2024-11-26" as the closure date
    And I click "Save Closure Date"
    Then I should see "Closed on 2024-11-26" on the detail page
    When I reload the page
    Then I should see "Closed on 2024-11-26" on the detail page
    When I am on the "Churning" page
    Then I should see "No Ascent hold in the lookback" for Bank of America

    Examples:
      | imported date |
      | unknown       |
      | 2025-02-30    |
