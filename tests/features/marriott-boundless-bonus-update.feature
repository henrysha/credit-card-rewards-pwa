Feature: Current Marriott Bonvoy Boundless welcome offer
  As a cardholder I want the catalog to reflect the current
  Marriott Bonvoy Boundless welcome offer

  Scenario: Catalog shows 200,000 points for the Boundless card (limited-time offer through Nov 11, 2026)
    Given I am on the "Catalog" page
    Then the "Marriott Bonvoy Boundless Card" catalog sign-up bonus should be 200000 points after 3000 spend in 3 months
