Feature: Hotel card family history and eligibility
  As a rewards tracker user
  I want Hilton and IHG products grouped into their card families
  So that product changes and bonus eligibility preserve family history

  Scenario: Hotel families appear in eligibility tracking
    Given I open the app
    When I navigate to the "Churning"
    Then I should see "Hilton" issuer section
    And I should see "IHG" issuer section

  Scenario: Adding a hotel card records family history
    Given I have added the "IHG One Rewards Traveler Credit Card" card
    When I navigate to the "Churning"
    Then I should see "Prior family history"
    And I should see "IHG One Rewards Traveler Credit Card" on the detail page
