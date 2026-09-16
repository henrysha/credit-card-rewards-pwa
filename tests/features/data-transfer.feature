Feature: Export and import persisted data
  As a user I want to move my saved data between devices

  Scenario: Export all saved data as JSON
    Given I have added the "Chase Sapphire Preferred" card
    And I navigate to the "Cards"
    When I open the settings menu
    And I open data transfer
    And I export a JSON backup
    Then the downloaded JSON backup should contain "chase-sapphire-preferred"

  Scenario: Export all saved data as CSV
    Given I have added the "Chase Sapphire Preferred" card
    And I navigate to the "Cards"
    When I open the settings menu
    And I open data transfer
    And I export a CSV backup
    Then the downloaded CSV backup should contain cards, bonuses, and perks

  Scenario: Importing a backup replaces the saved data
    Given I have added the "Chase Sapphire Preferred" card
    And I navigate to the "Cards"
    When I open the settings menu
    And I open data transfer
    And I choose a backup containing an Amex Gold card
    Then I should see a preview of 1 card
    When I replace the device data with the backup
    And I navigate to the "Cards"
    Then I should see "American Express Gold" on the cards page
    And I should not see "Chase Sapphire Preferred"

  Scenario: Reject an incomplete backup before replacing data
    Given I have added the "Chase Sapphire Preferred" card
    And I navigate to the "Cards"
    When I open the settings menu
    And I open data transfer
    And I choose a backup with an incomplete sign-up bonus
    Then I should see the backup error "Sign-up bonus 1 has an invalid bonusPoints."
    And I should not be able to replace the device data

  Scenario: Ignore a stale backup file read
    Given I am on the "Cards" page
    When I open the settings menu
    And I open data transfer
    And two backup file reads finish out of order
    Then the newer backup should remain selected

  Scenario: Export and restore preserves active and queued quarterly rewards
    Given the current date is in Q3
    And I have added the "Chase Freedom Flex" card
    When I navigate to the card detail page for "Chase Freedom Flex"
    And I add a current quarter reward for "Gas" with "5x" multiplier
    And I queue a next quarter reward for "Online Shopping" with "5x" multiplier
    And I navigate to the "Cards"
    When I open the settings menu
    And I open data transfer
    And I export a JSON backup
    Then the downloaded JSON backup should contain active and queued quarterly rewards
    When I clear the saved data
    And I choose the exported JSON backup
    When I replace the device data with the backup
    Then the database should contain active and queued quarterly rewards for "Chase Freedom Flex"
    When I navigate to the "Dashboard"
    Then I should see "Gas" in the best card section with "Chase Freedom Flex" and "5x" multiplier
    When the calendar reaches the next quarter boundary while the app is open
    When I navigate to the "Dashboard"
    Then I should see "Online Shopping" in the best card section with "Chase Freedom Flex" and "5x" multiplier

  Scenario: Export and restore via CSV preserves active and queued quarterly rewards
    Given the current date is in Q3
    And I have added the "Chase Freedom Flex" card
    When I navigate to the card detail page for "Chase Freedom Flex"
    And I add a current quarter reward for "Gas" with "5x" multiplier
    And I queue a next quarter reward for "Online Shopping" with "5x" multiplier
    And I navigate to the "Cards"
    When I open the settings menu
    And I open data transfer
    And I export a CSV backup
    Then the downloaded CSV backup should contain quarterly rewards
    When I clear the saved data
    And I choose the exported CSV backup
    When I replace the device data with the backup
    Then the database should contain active and queued quarterly rewards for "Chase Freedom Flex"
    When I navigate to the "Dashboard"
    Then I should see "Gas" in the best card section with "Chase Freedom Flex" and "5x" multiplier
    When the calendar reaches the next quarter boundary while the app is open
    When I navigate to the "Dashboard"
    Then I should see "Online Shopping" in the best card section with "Chase Freedom Flex" and "5x" multiplier

  Scenario: Older backup without quarterly rewards table clears stale rewards on card ID reuse
    Given the current date is in Q3
    And I have added the "Chase Freedom Flex" card
    When I navigate to the card detail page for "Chase Freedom Flex"
    And I add a current quarter reward for "Gas" with "5x" multiplier
    When I navigate to the "Dashboard"
    Then I should see "Gas" in the best card section with "Chase Freedom Flex" and "5x" multiplier
    And I navigate to the "Cards"
    When I open the settings menu
    And I open data transfer
    And I choose a backup containing an Amex Gold card
    Then I should see a preview of 1 card
    When I replace the device data with the backup
    Then all quarterly rewards should be removed from the database
    When I navigate to the "Dashboard"
    Then I should not see "Gas" in the best card section with "American Express Gold" and "5x" multiplier
    And I should not see "Gas" in the best card section with "Chase Freedom Flex" and "5x" multiplier

  Scenario: Reject a backup with an invalid quarterly reward
    Given I have added the "Chase Sapphire Preferred" card
    And I navigate to the "Cards"
    When I open the settings menu
    And I open data transfer
    And I choose a backup with an invalid quarterly reward
    Then I should see the backup error "Quarterly reward 1 refers to a missing card."
    And I should not be able to replace the device data
