Feature: Bilt Card 2.0 family
  As a card rewards user
  I want accurate Bilt consumer card products and shared eligibility rules
  So that my card history and product-change decisions remain correct

  Scenario: Bilt cards are present and filterable
    Given I am on the "Catalog" page
    When I click the "Bilt" filter button
    Then I should see 3 cards in the catalog
    And I should see "Bilt Blue Card"
    And I should see "Bilt Obsidian Card"
    And I should see "Bilt Palladium Card"

  Scenario: Add Bilt Palladium from the catalog
    Given I am on the "Catalog" page
    When I add the "Bilt Palladium Card" card
    And I navigate to the "Cards"
    Then I should see "Bilt Palladium Card" on the cards page

  Scenario: Bilt cards share family identifiers and welcome history rule
    Given I am on the "Catalog" page
    Then Bilt cards should share the "bilt-card-2.0" family
    And the Bilt welcome rule should affect all three Bilt cards

  Scenario: Bilt Card 2.0 is outside generic product changes
    Given I have added the "Bilt Blue Card" card
    When I view the card detail for "Bilt Blue Card"
    And I click "Upgrade / Downgrade"
    Then I should see "No other cards from Bilt are available for product change in the catalog."
