Feature: Card opening date
  Users can see and correct the opening date of a saved card.

  Background:
    Given I have added the "Chase Sapphire Preferred" card

  Scenario: Display the saved opening date and persist a correction
    Then the card should display its original opening date
    When I open the card details editor
    Then the opening date input should contain the original opening date
    When I enter "2020-02-29" as the card opening date
    And I click "Save Changes"
    Then I should see a toast "Card updated!"
    And the card should display opening date "2020-02-29"
    When I reload the page
    Then the card should display opening date "2020-02-29"
    When I view the card detail for "Chase Sapphire Preferred"
    Then the card should display opening date "2020-02-29"
    When I open the card details editor
    Then the opening date input should contain "2020-02-29"
    And the annual fee date input should still contain the original annual fee date

  Scenario: Cancel an opening date correction
    Then the card should display its original opening date
    When I open the card details editor
    And I enter "2020-02-29" as the card opening date
    And I click "Cancel"
    Then the card should display its original opening date
    When I open the card details editor
    Then the opening date input should contain the original opening date

  Scenario: Require an opening date before saving
    When I open the card details editor
    And I enter "" as the card opening date
    Then saving the opening date should be disabled
    When I enter "2020-02-29" as the card opening date
    Then saving the opening date should be enabled
