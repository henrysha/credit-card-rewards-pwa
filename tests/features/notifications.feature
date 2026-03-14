Feature: Perk Expiry Notifications
  As a user I want to see urgency indicators when perks are about to expire

  Scenario: Urgency badge shows on perks expiring soon
    Given I have added the "Chase Sapphire Reserve" card
    And a perk "$5 DoorDash Restaurant Credit" is set to expire in 2 days
    When I navigate to the "Perks"
    Then I should see an urgency badge on "$5 DoorDash Restaurant Credit"

  Scenario: Warning badge shows on perks expiring within a week
    Given I have added the "Chase Sapphire Reserve" card
    And a perk "$5 DoorDash Restaurant Credit" is set to expire in 5 days
    When I navigate to the "Perks"
    Then I should see a warning badge on "$5 DoorDash Restaurant Credit"

  Scenario: No badge on perks with plenty of time left
    Given I have added the "Chase Sapphire Reserve" card
    When I navigate to the "Perks"
    Then I should not see an urgency badge on "$300 Travel Credit"

  Scenario: Perk expiring today shows "Expires today" badge
    Given I have added the "Chase Sapphire Reserve" card
    And a perk "$5 DoorDash Restaurant Credit" is set to expire in 0 days
    When I navigate to the "Perks"
    Then I should see "Expires today" badge on "$5 DoorDash Restaurant Credit"

  @notifications
  Scenario: Push notification is triggered when perks are expiring soon
    Given I have added the "Chase Sapphire Reserve" card
    And a perk "$5 DoorDash Restaurant Credit" is set to expire in 2 days
    When I navigate to the "Dashboard"
    Then I should see a push notification "⚠️ Perks Expiring Soon" containing "$5 DoorDash Restaurant Credit"

  Scenario: Notification prompt not shown when permission is denied
    Given I have added the "Chase Sapphire Reserve" card
    When I navigate to the "Dashboard"
    Then I should not see the notification permission prompt
