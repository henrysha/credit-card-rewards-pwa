Feature: Request New Card
  As a user I want to be able to request cards that are missing from the catalog

  Scenario: Request a missing card from the catalog page
    Given I am on the "Catalog" page
    When I click the button "Request New Card"
    Then I should see the "Request New Card" modal
    When I enter "Marriott Bonvoy Boundless" into the "Card Name" field
    And I enter "Chase" into the "Issuer" field
    And I click the button "Continue to GitHub"
    Then I should be redirected to GitHub to create a new issue for the card

  Scenario: Request a missing card from the settings menu
    Given I open the app
    When I click the "Settings" button
    And I click the "Request New Card" menu item
    Then I should see the "Request New Card" modal
