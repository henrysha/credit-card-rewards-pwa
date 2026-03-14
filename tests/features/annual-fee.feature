Feature: Annual Fee Tracking
  As a user I want to know when my annual fees are due

  Scenario: Annual fee date is displayed on card detail
    Given I have added the "Chase Sapphire Reserve" card with annual fee date in 45 days
    When I navigate to the detail page for "Chase Sapphire Reserve"
    Then I should see the annual fee date displayed

  Scenario: Urgency indicator shows when annual fee is due soon
    Given I have added the "Chase Sapphire Reserve" card with annual fee date in 10 days
    When I navigate to the detail page for "Chase Sapphire Reserve"
    Then I should see an urgency indicator for the annual fee

  @notifications
  Scenario: Push notification is triggered when annual fee is due soon
    Given I have added the "Chase Sapphire Reserve" card with annual fee date in 5 days
    When I navigate to the "Dashboard"
    Then I should see a push notification "💳 Annual Fees Due Soon" containing "Chase Sapphire Reserve"

  Scenario: User can update the annual fee date after card is registered
    Given I have added the "Chase Sapphire Reserve" card with annual fee date in 45 days
    And I navigate to the detail page for "Chase Sapphire Reserve"
    When I click the edit icon next to the annual fee date
    And I change the annual fee date to 15 days from now
    And I click "Save Changes"
    Then I should see the annual fee date updated to 15 days from now
    And I should see an urgency indicator for the annual fee
