Feature: Share application
  As a user
  I want to share the application
  So that other people can open it easily

  Scenario: Share using the native share sheet
    Given I am on the dashboard
    And native application sharing is available
    When I click the settings menu button
    And I click the button "Share App"
    Then the application link should be shared
    And I should see the toast "App shared successfully"
    And the settings menu should be closed

  Scenario: Copy the application link when native sharing is unavailable
    Given I am on the dashboard
    And native application sharing is unavailable
    When I click the settings menu button
    And I click the button "Share App"
    Then the application link should be copied
    And I should see the toast "App link copied to clipboard"
    And the settings menu should be closed
