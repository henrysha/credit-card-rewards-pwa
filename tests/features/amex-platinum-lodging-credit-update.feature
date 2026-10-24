Feature: Current Amex Platinum lodging credit
  As a cardholder I want the catalog to reflect the October 2026
  Amex Platinum lodging credit update

  Scenario: Catalog shows the renamed $600 Lodging Credit with Airbnb Luxe eligibility
    Given I am on the "Catalog" page
    When I click on the card "American Express Platinum"
    Then I should see "$600 Lodging Credit" perk
    And I should not see "$600 Hotel Credit" perk
    And the "$600 Lodging Credit" perk description should mention "Airbnb Luxe"
    And the "$600 Lodging Credit" perk description should mention "from 1/1/2027"

  Scenario: Catalog shows the new $250 Airbnb Experiences credit
    Given I am on the "Catalog" page
    When I click on the card "American Express Platinum"
    Then I should see "$250 Airbnb Experiences Credit" perk
    And the "$250 Airbnb Experiences Credit" perk description should mention "Airbnb Luxe booking"
