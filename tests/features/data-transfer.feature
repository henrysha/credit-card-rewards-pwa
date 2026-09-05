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
    Then I should see "American Express Gold Card" on the cards page
    And I should not see "Chase Sapphire Preferred"
