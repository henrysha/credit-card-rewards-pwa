Feature: Quarterly rotating rewards
  Scenario Outline: Track quarterly activation on eligible Freedom cards
    Given I have added the "<card>" card
    When I view the card detail for "<card>"
    Then I should see "5% Quarterly Rotating Categories" in the perks list
    And the "5% Quarterly Rotating Categories" perk should have an Activate button
    And the "5% Quarterly Rotating Categories" perk should expire on "the end of quarter"
    When I click the info icon for the "5% Quarterly Rotating Categories" perk
    Then I should see a link to "https://www.chase.com/personal/credit-cards/freedom/freedomfive" in the modal
    And I should see "this app only tracks your confirmation" in the modal
    When I click the close button on the perk details modal
    And I activate the "5% Quarterly Rotating Categories" perk
    And I navigate to the "Perks"
    Then I should see "5% Quarterly Rotating Categories" on the perks page
    When I view the card detail for "<card>"
    And the app syncs catalog perks
    Then the "5% Quarterly Rotating Categories" perk should have a Deactivate button
    When I toggle the "5% Quarterly Rotating Categories" perk
    And the renewal period for "5% Quarterly Rotating Categories" expires
    And the app refreshes expired perks
    Then the "5% Quarterly Rotating Categories" perk should have an Activate button
    And the perk "5% Quarterly Rotating Categories" active status in DB should be "false"
    And the rotating reward should have no fixed credit value and be unused

    Examples:
      | card               |
      | Chase Freedom      |
      | Chase Freedom Flex |

  Scenario: Existing card receives the new perk exactly once
    Given I have added the "Chase Freedom" card
    When the rotating reward is missing from my saved card
    And the app syncs catalog perks
    And the app syncs catalog perks
    And I view the card detail for "Chase Freedom"
    Then I should see "5% Quarterly Rotating Categories" in the perks list
    And the "5% Quarterly Rotating Categories" perk should have an Activate button
    And the rotating reward should have no fixed credit value and be unused

  Scenario: Freedom Unlimited does not have rotating categories
    Given I have added the "Chase Freedom Unlimited" card
    When I view the card detail for "Chase Freedom Unlimited"
    Then I should not see "5% Quarterly Rotating Categories" in the perks list

  Scenario: One-time enrollment remains active after quarterly renewal
    Given I have added the "American Express Platinum" card
    When I view the card detail for "American Express Platinum"
    And I activate the "$400 Resy Credit" perk
    And the renewal period for "$400 Resy Credit" expires
    And the app refreshes expired perks
    Then the "$400 Resy Credit" perk should have a Deactivate button
