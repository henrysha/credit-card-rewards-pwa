Feature: Sign-up Bonus Tracking
  As a user I want to track my progress toward earning sign-up bonuses

  Scenario: View bonus progress on card detail
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    Then I should see "Sign-up Bonus" on the detail page
    And I should see "$0 / $6,000" spend progress
    And I should see a days remaining countdown

  Scenario: Update bonus spend
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    And I update the bonus spend to 3000
    Then I should see "$3,000 / $6,000" spend progress

  Scenario: Bonus marked complete when target reached
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    And I update the bonus spend to 6000
    Then I should see the bonus marked as complete
  Scenario: Edit bonus details
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    And I edit the bonus to require 1000 spend for 80000 points
    Then I should see "$0 / $1,000" spend progress
    And I should see "80,000 points" as the bonus amount
