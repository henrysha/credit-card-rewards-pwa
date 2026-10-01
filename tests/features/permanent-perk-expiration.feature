Feature: Permanent perk expiration
  Expiration dates are inclusive local calendar dates.
  Used records remain saved as history but expired benefits are unavailable.

  Scenario Outline: Catalog and new cards respect the local expiration boundary
    Given the perk calendar uses "<zone>" at "<last-day>"
    When I open the Reserve catalog benefits
    Then I should see "$250 Select Hotel Credit" in the perks list
    Given I have added the "Chase Sapphire Reserve" card
    Then the saved "csr-select-hotel" perk count should be 1
    And the unclaimed perk badge should be 1230 dollars
    When I open the Reserve catalog benefits
    And the perk calendar advances to "<next-day>"
    Then I should not see "$250 Select Hotel Credit" in the perks list
    Given I have added the "Chase Sapphire Reserve" card
    Then the saved "csr-select-hotel" perk count should be 0
    And I should see "$300 Travel Credit" in the perks list
    And the saved "csr-stubhub" perk count should be 2
    And the unclaimed perk badge should be 980 dollars

    Examples:
      | zone                 | last-day             | next-day             |
      | America/New_York     | 2027-01-01T04:59:00Z | 2027-01-01T05:01:00Z |
      | Pacific/Kiritimati   | 2026-12-31T09:59:00Z | 2026-12-31T10:01:00Z |

  Scenario Outline: Refresh removes permanently expired unused perks regardless of period
    Given the perk calendar uses "America/New_York" at "2026-12-31T17:00:00Z"
    And I have added the "Chase Sapphire Reserve" card
    And the select hotel perk has renewal "<period>" and period end "<end>"
    When the perk clock moves to "2027-01-01T17:00:00Z" without lifecycle cleanup
    And the app refreshes expired perks
    Then the saved "csr-select-hotel" perk count should be 0
    When the app syncs catalog perks
    And the app refreshes expired perks
    And the app syncs catalog perks
    Then the saved "csr-select-hotel" perk count should be 0
    And the saved "csr-travel-credit" perk count should be 1
    And the saved "csr-stubhub" perk count should be 1

    Examples:
      | period        | end        |
      | annual        | 2026-12-31 |
      | every-4-years | 2030-12-31 |
      | one-time      | 9999-12-31 |
      | ongoing       | 9999-12-31 |

  Scenario: Sync removes expired unused perks without recreating them
    Given the perk calendar uses "America/New_York" at "2026-12-31T17:00:00Z"
    And I have added the "Chase Sapphire Reserve" card
    When the perk clock moves to "2027-01-01T17:00:00Z" without lifecycle cleanup
    And the app syncs catalog perks
    And the app syncs catalog perks
    Then the saved "csr-select-hotel" perk count should be 0

  Scenario: Used history survives permanent expiration and repeated renewal
    Given the perk calendar uses "America/New_York" at "2026-12-31T17:00:00Z"
    And I have added the "Chase Sapphire Reserve" card
    When I toggle the "$250 Select Hotel Credit" perk
    And the perk calendar advances to "2027-01-01T17:00:00Z"
    And the app refreshes expired perks
    And the app syncs catalog perks
    And the app refreshes expired perks
    Then the saved select hotel history should still be used on "2026-12-31"
    And I should not see "$250 Select Hotel Credit" in the perks list
    And the unclaimed perk badge should be 980 dollars
    When I navigate to the "Perks"
    And I click "Used"
    Then I should not see "$250 Select Hotel Credit" in the perks list

  Scenario: Displays exclude stale expired records before cleanup
    Given the perk calendar uses "America/New_York" at "2026-12-31T17:00:00Z"
    And I have added the "Chase Sapphire Reserve" card
    When the perk clock moves to "2027-01-01T17:00:00Z" without lifecycle cleanup
    And I navigate to the "Perks"
    Then the saved "csr-select-hotel" perk count should be 1
    And I should not see "$250 Select Hotel Credit" in the perks list
    And the unclaimed perk badge should be 980 dollars
    When I navigate to the "Dashboard"
    Then the dashboard unused perk value should be 980 dollars
    When I open the saved Reserve benefits without reloading
    Then I should not see "$250 Select Hotel Credit" in the perks list
    And the unclaimed perk badge should be 980 dollars

  Scenario: Product changes do not create permanently expired perks
    Given the perk calendar uses "America/New_York" at "2027-01-01T17:00:00Z"
    And I have added the "Chase Sapphire Preferred" card
    When I click "Upgrade / Downgrade"
    Then the Reserve product change preview should show 16 perks
    When I select "Chase Sapphire Reserve" for product change
    And I confirm the product change
    Then the saved "csr-select-hotel" perk count should be 0
    And I should not see "$250 Select Hotel Credit" in the perks list
    And the unclaimed perk badge should be 980 dollars

  Scenario: Future-expiring perks continue to renew and retain activation
    Given the perk calendar uses "America/New_York" at "2026-12-31T17:00:00Z"
    And I have added the "Chase Sapphire Reserve" card
    When I activate the "$300 StubHub/Viagogo Credit" perk
    And I toggle the "$300 StubHub/Viagogo Credit" perk
    And the perk calendar advances to "2027-01-01T17:00:00Z"
    And the app refreshes expired perks
    Then the "$300 StubHub/Viagogo Credit" perk should not be marked as used
    And the perk "$300 StubHub/Viagogo Credit" active status in DB should be "true"
    And the unclaimed perk badge should be 1130 dollars

  Scenario: Catalog card previews update across the expiration boundary
    Given the perk calendar uses "America/New_York" at "2027-01-01T04:59:00Z"
    And I am on the "Catalog" page
    Then the Reserve preview should include the select hotel credit
    When the perk calendar advances to "2027-01-01T05:01:00Z"
    Then the Reserve preview should exclude the select hotel credit
