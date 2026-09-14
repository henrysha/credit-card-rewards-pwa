Feature: Update saved card number
  Users can manage the last four digits of an existing card.

  Background:
    Given I have added the "Chase Sapphire Preferred" card

  Scenario: Add and replace a card number and persist it across views
    When I open the card details editor
    And I enter "1234" as the saved card number
    And I click "Save Changes"
    Then I should see a toast "Card updated!"
    When I open the card details editor
    Then the saved card number input should contain "1234"
    When I enter "0098" as the saved card number
    And I click "Save Changes"
    Then the card should display saved number "0098"
    When I reload the page
    Then the card should display saved number "0098"
    When I navigate to the "Cards"
    Then the card should display saved number "0098"

  Scenario: Cancel changes and clear the saved number
    When I open the card details editor
    And I enter "1234" as the saved card number
    And I click "Save Changes"
    Then the card should display saved number "1234"
    When I open the card details editor
    And I enter "9876" as the saved card number
    And I click "Cancel"
    Then the card should display saved number "1234"
    When I open the card details editor
    Then the saved card number input should contain "1234"
    When I enter "" as the saved card number
    And I click "Save Changes"
    Then I should see "No card number saved" on the detail page
    When I reload the page
    Then I should see "No card number saved" on the detail page
    When I open the card details editor
    Then the saved card number input should contain ""

  Scenario: Require exactly four digits or an empty value
    When I open the card details editor
    And I enter "12" as the saved card number
    Then saving the card number should be disabled
    When I enter "ab12" as the saved card number
    Then the saved card number input should contain "12"
    And saving the card number should be disabled
    When I enter "0123" as the saved card number
    Then saving the card number should be enabled
    When I enter "" as the saved card number
    Then saving the card number should be enabled
