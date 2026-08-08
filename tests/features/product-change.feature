Feature: Product Change (Upgrading / Downgrading)
  As a credit card holder
  I want to upgrade or downgrade my cards to other products from the same publisher
  So that I can optimize my perks and annual fees while maintaining my account history

  Scenario: View product change options for same publisher only
    Given I have added the "Chase Sapphire Preferred" card
    When I view the card detail for "Chase Sapphire Preferred"
    And I click "Upgrade / Downgrade"
    Then I should see the product change modal
    And I should see "Chase Sapphire Reserve" in the product change options
    And I should see "Chase Freedom Unlimited" in the product change options
    And I should not see "American Express Platinum" in the product change options
    And I should not see "Capital One Venture X" in the product change options

  Scenario: Upgrade a card to a higher annual fee product
    Given I have added the "Chase Sapphire Preferred" card
    When I view the card detail for "Chase Sapphire Preferred"
    And I click "Upgrade / Downgrade"
    And I select "Chase Sapphire Reserve" for product change
    Then I should see "Confirm Card Upgrade"
    When I confirm the product change
    Then I should see "Chase Sapphire Reserve"
    And I should see "$300 Travel Credit" in the perks list

  Scenario: Downgrade a card to a lower annual fee product
    Given I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    And I click "Upgrade / Downgrade"
    And I select "Chase Freedom Unlimited" for product change
    Then I should see "Confirm Card Downgrade"
    When I confirm the product change
    Then I should see "Chase Freedom Unlimited"

  Scenario: Old card appears in Closed / Product Changed section on Cards page
    Given I have added the "Chase Sapphire Preferred" card
    When I view the card detail for "Chase Sapphire Preferred"
    And I click "Upgrade / Downgrade"
    And I select "Chase Sapphire Reserve" for product change
    And I confirm the product change
    And I navigate to the "Cards"
    Then I should see "Chase Sapphire Reserve" on the cards page
    And I should see "product-changed" in the closed cards section
