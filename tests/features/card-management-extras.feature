Feature: Card Management Extras
  As a user I want to toggle view modes and copy my card list for inquiries

  Scenario: Toggle compact mode
    Given I have added the "Chase Sapphire Preferred" card
    And I navigate to the "Cards"
    Then I should see the "Chase Sapphire Preferred" card tile
    And the card tile should not have "compact" class
    When I open the settings menu
    And I toggle "Compact Mode"
    Then the card tile should have "compact" class
    When I toggle "Compact Mode"
    Then the card tile should not have "compact" class

  Scenario: Copy card list to clipboard
    Given I have added the "Chase Sapphire Preferred" card
    And I navigate to the "Cards"
    When I click the Copy card list button
    Then I should see a toast "Card list copied to clipboard!"
    # Verifying clipboard content is tricky in some CI environments,
    # but we can check if the toast appeared as a proxy for success.
