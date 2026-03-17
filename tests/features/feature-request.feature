Feature: Feature Request
  As a user
  I want to be able to submit feature requests
  So that the app can be improved over time

  Scenario: User submits a feature request from the dashboard
    Given I am on the dashboard
    When I click the settings menu button
    And I click the button "Request Feature"
    Then I should see the "Submit Feature Request" modal
    When I fill in "Title" with "Support for Hilton cards"
    And I fill in "Description" with "Please add support for Hilton Honors American Express cards"
    And I click the button "Continue to GitHub"
    Then the modal should be closed
