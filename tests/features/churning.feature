Feature: Churning Tracker
  As a user I want to track my churning eligibility across card issuers

  Scenario: View churning page with no cards
    Given I open the app
    When I am on the "Churning" page
    Then I should see "0/5" as the 5/24 count
    And I should see "Under 5/24"

  Scenario: 5/24 counter increments when card added
    Given I have added the "Chase Sapphire Reserve" card
    When I am on the "Churning" page
    Then I should see "1/5" as the 5/24 count
    And I should see "Under 5/24"

  Scenario: Business cards do not count towards 5/24
    Given I have added the "Chase Sapphire Reserve" card
    And I have added the "Chase Ink Business Cash" card
    And I have added the "Amex Blue Business Cash™" card
    When I am on the "Churning" page
    Then I should see "1/5" as the 5/24 count
    And I should see "Under 5/24"

  Scenario: All issuer churning rules are displayed
    Given I open the app
    When I am on the "Churning" page
    Then I should see "Chase" issuer section
    And I should see "Amex" issuer section
    And I should see "Capital One" issuer section
    And I should see "Citi" issuer section
