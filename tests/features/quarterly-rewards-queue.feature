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

  Scenario: Automatic rotation at local midnight in a timezone ahead of UTC
    Given I open the app in a timezone ahead of UTC
    And I have added the "Chase Freedom Flex" card
    When I navigate to the card detail page for "Chase Freedom Flex"
    And I add a current quarter reward for "Gas" with "5x" multiplier
    And I queue a next quarter reward for "Online Shopping" with "5x" multiplier
    When local midnight arrives for the new quarter while UTC is still the previous day
    When I navigate to the "Dashboard"
    Then I should see "Online Shopping" in the best card section with "Chase Freedom Flex" and "5x" multiplier
    And I should not see "Gas" in the best card section with "Chase Freedom Flex" and "5x" multiplier

  Scenario: December-January rollover and reopening
    Given the current date is in December
    And I have added the "Chase Freedom Flex" card
    When I navigate to the card detail page for "Chase Freedom Flex"
    Then the next quarter queue should be for "Q1" of next year
    When I queue a next quarter reward for "Groceries" with "5x" multiplier
    When the calendar reaches January 1st of next year
    And I reopen the app
    When I navigate to the "Dashboard"
    Then I should see "Groceries" in the best card section with "Chase Freedom Flex" and "5x" multiplier

  Scenario: Merchant, payment-method, and wholesale categories activate without broad inflation
    Given the current date is in December
    And I have added the "Chase Freedom Flex" card
    When I navigate to the card detail page for "Chase Freedom Flex"
    And I queue a next quarter reward for "PayPal" with "5x" multiplier
    And I queue a next quarter reward for "Target" with "5x" multiplier
    And I queue a next quarter reward for "Wholesale Clubs" with "5x" multiplier
    And I queue a next quarter reward for "Select Live Entertainment" with "5x" multiplier
    When the calendar reaches the next quarter boundary while the app is open
    When I navigate to the "Dashboard"
    Then "Online Shopping" broad category should remain at "1x"
    And "Groceries" broad category should remain at "1x"
    And "Streaming" broad category should remain at "1x"
    When I click to expand the "Online Shopping" category
    Then I should see the "PayPal" subcategory with "5x" multiplier
    And I should see the "Target" subcategory with "5x" multiplier
    When I click to expand the "Groceries" category
    Then I should see the "Wholesale Clubs" subcategory with "5x" multiplier
    When I click to expand the "Streaming" category
    Then I should see the "Live Entertainment" subcategory with "5x" multiplier

  Scenario: Optional quarterly limit clearing and custom multiplier feedback
    Given I have added the "Chase Freedom Flex" card
    When I navigate to the card detail page for "Chase Freedom Flex"
    When I queue a next quarter reward for "Gas" with "7x" multiplier and cleared limit
    Then I should see a toast confirming "Queued Gas (7x)"
    And the queued reward for "Gas" should not have a spend limit displayed

  Scenario: Managing queued rewards by removing an item from the queue
    Given I have added the "Chase Freedom Flex" card
    When I navigate to the card detail page for "Chase Freedom Flex"
    And I queue a next quarter reward for "Online Shopping" with "5x" multiplier
    Then I should see "Online Shopping" in the next quarter queue
    When I remove "Online Shopping" from the next quarter queue
    Then I should not see "Online Shopping" in the next quarter queue

  Scenario: Mixed-card recommendations preserve Wholesale Clubs and Live Entertainment without broad rate suppression
    Given I have added the "Amex Blue Cash Preferred" card
    And I have added the "Chase Freedom Flex" card
    When I navigate to the card detail page for "Chase Freedom Flex"
    And I queue a next quarter reward for "Wholesale Clubs" with "5x" multiplier
    And I queue a next quarter reward for "Select Live Entertainment" with "5x" multiplier
    When the calendar reaches the next quarter boundary while the app is open
    When I navigate to the "Dashboard"
    Then "Groceries" broad category should remain at "6x"
    And "Streaming" broad category should remain at "6x"
    When I click to expand the "Groceries" category
    Then I should see the "Wholesale Clubs" subcategory with "5x" multiplier
    And I should see "Chase Freedom Flex" as the recommended card for "Wholesale Clubs"
    When I click to expand the "Streaming" category
    Then I should see the "Live Entertainment" subcategory with "5x" multiplier
    And I should see "Chase Freedom Flex" as the recommended card for "Live Entertainment"

  Scenario: Rewards lifecycle cleans up without polling or dangling timers
    Then the rewards lifecycle handles cleanup without rescheduling or orphan timers

