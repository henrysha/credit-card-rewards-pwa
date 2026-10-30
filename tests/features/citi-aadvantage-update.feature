Feature: Current Citi AAdvantage welcome offers
  As a cardholder I want the catalog and my tracked bonus to reflect the current
  Citi AAdvantage welcome offers

  Scenario: Catalog shows the October 2026 Citi AAdvantage welcome offers
    Given I am on the "Catalog" page
    Then the "Citi® / AAdvantage® Platinum Select® World Elite Mastercard®" catalog sign-up bonus should be 80000 miles after 3500 spend in 4 months
    And the "Citi® / AAdvantage Business™ World Elite Mastercard®" catalog sign-up bonus should be 75000 miles after 5000 spend in 5 months
    And the "American Airlines AAdvantage® MileUp® Mastercard®" catalog sign-up bonus should be 15000 miles after 500 spend in 3 months
    And the "American Airlines AAdvantage® MileUp® Mastercard®" catalog sign-up bonus should include "Additional $100 statement credit after meeting the spend requirement"

  Scenario: MileUp statement credit survives adding and reloading the card
    Given I have added the "American Airlines AAdvantage® MileUp® Mastercard®" card
    When I view the card detail for "American Airlines AAdvantage® MileUp® Mastercard®"
    Then I should see "Plus: Additional $100 statement credit after meeting the spend requirement" on the detail page
    When I reload the page
    Then I should see "Plus: Additional $100 statement credit after meeting the spend requirement" on the detail page
    And I should see "15,000" as the bonus amount
