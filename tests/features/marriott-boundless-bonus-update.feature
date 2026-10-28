Feature: Current Marriott Bonvoy Boundless welcome offer
  As a cardholder I want the catalog to reflect the current
  Marriott Bonvoy Boundless welcome offer

  Scenario: Catalog shows three Free Night Awards for the Boundless card
    Given I am on the "Catalog" page
    Then the "Marriott Bonvoy Boundless Card" catalog sign-up bonus should be 3 "Free Night Awards (up to 50,000 points each)" after 3000 spend in 3 months
