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
    And I should not see "United Gateway Card" in the product change options
    And I should not see "Marriott Bonvoy Boundless Card" in the product change options

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

  Scenario: SKYPASS products can product change within U.S. Bank only
    Given I have added the "SKYPASS SkyBlue Visa" card
    When I view the card detail for "SKYPASS SkyBlue Visa"
    And I click "Upgrade / Downgrade"
    Then I should see "SKYPASS Visa Signature" in the product change options
    And I should see "SKYPASS Select Visa Signature" in the product change options
    And I should not see "Chase Sapphire Reserve" in the product change options

  Scenario: Hotel product changes stay within the same family
    Given I have added the "Hilton Honors American Express Card" card
    When I view the card detail for "Hilton Honors American Express Card"
    And I click "Upgrade / Downgrade"
    Then I should see "Hilton Honors American Express Surpass Card" in the product change options
    And I should not see "IHG One Rewards Premier Credit Card" in the product change options

  Scenario: Direct cross-family product changes are rejected
    Given I have added the "Hilton Honors American Express Card" card
    When I attempt a direct product change to "American Express Gold"
    Then the direct product change should be rejected without mutating the account

  Scenario: Cards without an explicit family cannot be product changed
    Given I have added the "American Express Gold" card
    When I attempt a direct product change to "American Express Platinum"
    Then the direct product change should be rejected without mutating the account

  Scenario: Co-branded product changes stay within the card family
    Given I have added the "United Explorer Card" card
    When I view the card detail for "United Explorer Card"
    And I click "Upgrade / Downgrade"
    Then I should see "United Quest Card" in the product change options
    And I should not see "Marriott Bonvoy Boundless Card" in the product change options

  Scenario: Direct product change rejects a core-to-United mutation
    Given I have added the "Chase Sapphire Preferred" card
    When I attempt a direct product change to "United Gateway Card"
    Then the direct product change should be rejected without mutating the account

  Scenario: Direct product change rejects a United-to-Marriott mutation
    Given I have added the "United Explorer Card" card
    When I attempt a direct product change to "Marriott Bonvoy Boundless Card"
    Then the direct product change should be rejected without mutating the account

  Scenario: Direct product change rejects a Marriott-to-core mutation
    Given I have added the "Marriott Bonvoy Bold Card" card
    When I attempt a direct product change to "Chase Freedom Unlimited"
    Then the direct product change should be rejected without mutating the account

  Scenario: Personal Chase cards cannot product change into business cards
    Given I have added the "Chase Sapphire Preferred" card
    When I attempt a direct product change to "Chase Ink Business Cash"
    Then the direct product change should be rejected without mutating the account

  Scenario: Product change between rotating cards preserves and rekeys active and queued quarterly rewards
    Given I have added the "Chase Freedom Flex" card
    When I navigate to the card detail page for "Chase Freedom Flex"
    And I add a current quarter reward for "Gas" with "5x" multiplier
    And I queue a next quarter reward for "Online Shopping" with "5x" multiplier
    And I click "Upgrade / Downgrade"
    And I select "Chase Freedom" for product change
    And I confirm the product change
    Then I should see "Chase Freedom"
    And I should see the rotating rewards section
    And I should see "Gas" in the rotating rewards section
    And I should see "Online Shopping" in the next quarter queue
    And the active quarterly rewards should be rekeyed to the replacement card in the database
    When I navigate to the "Dashboard"
    Then I should see "Gas" in the best card section with "Chase Freedom" and "5x" multiplier
    And I should not see "Gas" in the best card section with "Chase Freedom Flex" and "5x" multiplier
    When the calendar reaches the next quarter boundary while the app is open
    When I navigate to the "Dashboard"
    Then I should see "Online Shopping" in the best card section with "Chase Freedom" and "5x" multiplier
    And I should not see "Online Shopping" in the best card section with "Chase Freedom Flex" and "5x" multiplier
    And I should not see "Gas" in the best card section with "Chase Freedom" and "5x" multiplier

  Scenario: Product change to incompatible non-rotating card removes quarterly rewards
    Given I have added the "Chase Freedom Flex" card
    When I navigate to the card detail page for "Chase Freedom Flex"
    And I add a current quarter reward for "Gas" with "5x" multiplier
    And I queue a next quarter reward for "Online Shopping" with "5x" multiplier
    And I click "Upgrade / Downgrade"
    And I select "Chase Freedom Unlimited" for product change
    And I confirm the product change
    Then I should see "Chase Freedom Unlimited"
    And I should not see the rotating rewards section
    And all quarterly rewards should be removed from the database
    When I navigate to the "Dashboard"
    Then I should not see "Gas" in the best card section with "Chase Freedom Unlimited" and "5x" multiplier
    And I should not see "Gas" in the best card section with "Chase Freedom Flex" and "5x" multiplier
    When the calendar reaches the next quarter boundary while the app is open
    When I navigate to the "Dashboard"
    Then I should not see "Online Shopping" in the best card section with "Chase Freedom Unlimited" and "5x" multiplier
    And I should not see "Online Shopping" in the best card section with "Chase Freedom Flex" and "5x" multiplier
    And all quarterly rewards should be removed from the database
