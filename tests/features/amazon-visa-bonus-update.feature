Feature: Current Amazon Visa welcome offers
  As a cardholder I want the catalog to reflect the current
  Amazon Visa welcome offers

  Scenario: Catalog shows the November 2026 Amazon Visa welcome offers
    Given I am on the "Catalog" page
    Then the "Amazon Prime Visa" catalog sign-up bonus should be 20000 "Amazon Gift Card ($200)" after 0 spend in 0 months
    And the "Amazon Visa" catalog sign-up bonus should be 6000 "Amazon Gift Card ($60)" after 0 spend in 0 months
