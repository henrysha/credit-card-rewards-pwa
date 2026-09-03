Feature: Chase co-branded card families
  As a rewards tracker user I want family membership and history to be preserved
  So that eligibility and product changes reflect issuer rules

  Scenario: United products share a family identifier
    Given I open the app
    Then the cards "United Gateway Card", "United Explorer Card", "United Quest Card", and "United Club Card" should share a family identifier

  Scenario: Marriott products share a family identifier
    Given I open the app
    Then the cards "Marriott Bonvoy Bold Card" and "Marriott Bonvoy Boundless Card" should share a family identifier

  Scenario: Chase family eligibility rules are displayed
    Given I open the app
    When I am on the "Churning" page
    Then I should see "United Family Eligibility" rule
    And I should see "Marriott Bonvoy Family Eligibility" rule

  Scenario: Adding two products preserves family history
    Given I have added the "United Explorer Card" card
    And I have added the "United Quest Card" card
    When I navigate to the "Cards"
    Then I should see "United Explorer Card" on the cards page
    And I should see "United Quest Card" on the cards page
