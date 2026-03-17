Feature: Add Card
  As a user I want to add credit cards to my wallet from the catalog

  Scenario: Add a card from the catalog
    Given I am on the "Catalog" page
    When I click on the "Chase Sapphire Reserve" card in the catalog
    Then I should see "Chase Sapphire Reserve"
    And I should see "Sign-up Bonus"
    And I should see "Add This Card"

  Scenario: Card appears on My Cards after adding
    Given I am on the "Catalog" page
    When I add the "Chase Sapphire Reserve" card
    And I navigate to the "Cards"
    Then I should see "Chase Sapphire Reserve" on the cards page

  Scenario: Card detail shows bonus and perks after adding
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    Then I should see "Sign-up Bonus" on the detail page
    And I should see "$300 Travel Credit" in the perks list
    And I should see "Earning Rates" on the detail page
