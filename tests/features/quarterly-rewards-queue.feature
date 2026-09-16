Feature: Quarterly Rewards Queue and Rotation
  As a Chase Freedom cardholder
  I want to queue upcoming quarterly 5x rewards
  So that when the new quarter arrives, the rewards rotate automatically without prematurely replacing current rewards

  Background:
    Given I open the app

  Scenario: Queue next quarter rewards for Chase Freedom and verify persistence
    Given I have added the "Chase Freedom Flex" card
    When I navigate to the card detail page for "Chase Freedom Flex"
    Then I should see the rotating rewards section
    When I queue a next quarter reward for "Online Shopping" with "5x" multiplier
    Then I should see "Online Shopping" in the next quarter queue
    When I reload the page
    Then I should still see "Online Shopping" in the next quarter queue with "Queued" status

  Scenario: Pre-boundary current rewards apply and queued rewards do not apply prematurely
    Given I have added the "Chase Freedom Flex" card
    When I navigate to the card detail page for "Chase Freedom Flex"
    And I add a current quarter reward for "Gas" with "5x" multiplier
    And I queue a next quarter reward for "Online Shopping" with "5x" multiplier
    When I navigate to the "Dashboard"
    Then I should see "Gas" in the best card section with "Chase Freedom Flex" and "5x" multiplier
    And I should not see "Online Shopping" in the best card section with "Chase Freedom Flex" and "5x" multiplier

  Scenario: Automatic rotation on calendar quarter boundary while app remains open
    Given I have added the "Chase Freedom Flex" card
    When I navigate to the card detail page for "Chase Freedom Flex"
    And I add a current quarter reward for "Gas" with "5x" multiplier
    And I queue a next quarter reward for "Online Shopping" with "5x" multiplier
    When I navigate to the "Dashboard"
    Then I should see "Gas" in the best card section with "Chase Freedom Flex" and "5x" multiplier
    When the calendar reaches the next quarter boundary while the app is open
    Then I should see "Online Shopping" in the best card section with "Chase Freedom Flex" and "5x" multiplier
    And I should not see "Gas" in the best card section with "Chase Freedom Flex" and "5x" multiplier

  Scenario: Automatic activation after reopening the app
    Given I have added the "Chase Freedom Flex" card
    When I navigate to the card detail page for "Chase Freedom Flex"
    And I queue a next quarter reward for "Online Shopping" with "5x" multiplier
    When the calendar reaches the next quarter boundary
    And I reopen the app
    When I navigate to the "Dashboard"
    Then I should see "Online Shopping" in the best card section with "Chase Freedom Flex" and "5x" multiplier

  Scenario: Year rollover boundary rotation from Q4 to Q1
    Given the current date is in Q4
    And I have added the "Chase Freedom Flex" card
    When I navigate to the card detail page for "Chase Freedom Flex"
    Then the next quarter queue should be for "Q1" of next year
    When I queue a next quarter reward for "Groceries" with "5x" multiplier
    When the calendar reaches January 1st of next year
    And I reopen the app
    When I navigate to the "Dashboard"
    Then I should see "Groceries" in the best card section with "Chase Freedom Flex" and "5x" multiplier

  Scenario: Managing queued rewards by removing an item from the queue
    Given I have added the "Chase Freedom Flex" card
    When I navigate to the card detail page for "Chase Freedom Flex"
    And I queue a next quarter reward for "Online Shopping" with "5x" multiplier
    Then I should see "Online Shopping" in the next quarter queue
    When I remove "Online Shopping" from the next quarter queue
    Then I should not see "Online Shopping" in the next quarter queue
