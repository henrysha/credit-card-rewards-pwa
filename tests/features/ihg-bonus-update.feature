Feature: Current IHG One Rewards welcome offers
  As a cardholder I want the catalog to reflect the current
  IHG One Rewards welcome offers after the launch offers ended

  Scenario: Catalog shows the November 2026 IHG One Rewards welcome offers
    Given I am on the "Catalog" page
    Then the "IHG One Rewards Credit Card" catalog sign-up bonus should be 80000 points after 2000 spend in 3 months
    And the "IHG One Rewards Premier Credit Card" catalog sign-up bonus should be 140000 points after 3000 spend in 3 months
