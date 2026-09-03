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

  Scenario: Boundless displays and persists the complete four-award offer
    Given I open the app
    When I navigate to the "Catalog"
    And I click on the "Marriott Bonvoy Boundless Card" card in the catalog
    Then I should see "Spend $3,000 to earn 3 Free Night Awards" on the detail page
    And I should see "Additional 1 Free Night Award after $4,000 total eligible spend within the first 4 months" on the detail page
    When I click "Add This Card"
    Then I should see "Additional 1 Free Night Award after $4,000 total eligible spend within the first 4 months" on the detail page

  Scenario: United authorized-user bonus persists after adding the card
    Given I have added the "United Explorer Card" card
    Then I should see "Additional 10K miles after adding an authorized user within the first 3 months" on the detail page

  Scenario: Explorer rideshare credit renews monthly
    Given I have added the "United Explorer Card" card
    When I view the card detail for "United Explorer Card"
    Then the "$60 Rideshare Credit" perk should expire on "end of the current month"
    When I activate the "$60 Rideshare Credit" perk
    And I toggle the "$60 Rideshare Credit" perk
    And the renewal period for "$60 Rideshare Credit" expires
    And the app refreshes expired perks
    Then the "$60 Rideshare Credit" perk should not be marked as used

  Scenario: Bold point redemptions do not inflate unused perk value
    Given I have added the "Marriott Bonvoy Bold Card" card
    When I navigate to the "Dashboard"
    Then I should see "$0" as the unused perks value

  Scenario: Boundless airline credit renews semi-annually
    Given I have added the "Marriott Bonvoy Boundless Card" card
    When I view the card detail for "Marriott Bonvoy Boundless Card"
    Then the "$100 Airline Credits (Temporary Offer)" perk should expire on "end of the current half"
    When I toggle the "$100 Airline Credits (Temporary Offer)" perk
    And the renewal period for "$100 Airline Credits (Temporary Offer)" expires
    And the app refreshes expired perks
    Then the "$100 Airline Credits (Temporary Offer)" perk should not be marked as used
