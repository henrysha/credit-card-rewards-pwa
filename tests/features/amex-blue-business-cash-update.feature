Feature: Current Amex Blue Business Cash welcome offer
  As a cardholder I want the catalog to reflect the current
  Amex Blue Business Cash welcome offer

  Scenario: Catalog shows the October 2026 Amex Blue Business Cash welcome offer
    Given I am on the "Catalog" page
    Then the "Amex Blue Business Cash™" catalog sign-up bonus should be 500 "cash back (up to; personalized offer)" after 5000 spend in 3 months

  Scenario: Blue Business Cash offer-variance disclaimer shows on the card detail page
    Given I have added the "Amex Blue Business Cash™" card
    When I view the card detail for "Amex Blue Business Cash™"
    Then I should see "Welcome offers vary; the advertised maximum is not guaranteed. Confirm your offer with American Express." on the detail page
