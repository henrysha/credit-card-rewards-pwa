Feature: Verified October 2026 catalog benefits
  Catalog benefits show issuer restrictions and track credits on their actual cadence.

  Background:
    Given the perk calendar uses "America/New_York" at "2026-10-18T17:00:00Z"

  Scenario Outline: Freedom separates its trial membership from the recurring DoorDash discount
    Given I am on the "Catalog" page
    When I click on the card "<card>"
    Then the "DashPass 6-Month Trial" perk should show 60 dollars
    And the "DashPass 6-Month Trial" perk description should mention "Automatically renews"
    And the "$10 Quarterly DoorDash Credit" perk should show 10 dollars per "qtr"
    And the "$10 Quarterly DoorDash Credit" perk description should mention "non-restaurant"
    And the "$10 Quarterly DoorDash Credit" perk description should mention "12/31/2027"
    And the "$10 Quarterly DoorDash Credit" perk description should mention "while enrolled in DashPass"

    Examples:
      | card                    |
      | Chase Freedom Flex      |
      | Chase Freedom Unlimited |

  Scenario: Sapphire Preferred DoorDash promotion runs through 2029
    Given the perk calendar uses "America/New_York" at "2028-01-01T17:00:00Z"
    And I am on the "Catalog" page
    When I click on the card "Chase Sapphire Preferred"
    Then I should see "DashPass Membership" perk
    And I should see "$10 DoorDash Credit" perk
    And the "DashPass Membership" perk description should mention "12/31/2029"
    And the "$10 DoorDash Credit" perk should show 10 dollars per "mo"

  Scenario: IHG Premier fee, earning rates and refreshed elite benefits
    Given I am on the "Catalog" page
    When I click on the card "IHG One Rewards Premier Credit Card"
    Then the card annual fee should be 150 dollars
    And I should see "IHG One Rewards Gold Elite Status" perk
    And I should not see "IHG One Rewards Platinum Elite Status" perk
    And the "IHG One Rewards Gold Elite Status" perk description should mention "Platinum Elite at $15,000"
    And the "IHG One Rewards Gold Elite Status" perk description should mention "Diamond Elite at $40,000"
    And the "Anniversary Free Night" perk description should mention "50,000 points"
    And the "15 Elite Night Credits" perk description should mention "another 5 after $15,000"
    And I should see "Flights (Direct), Rental Cars, Dining, Grocery & Gas" earning rate with "5x"

  Scenario: IHG Premier credits state their qualifying purchases and periods
    Given I am on the "Catalog" page
    When I click on the card "IHG One Rewards Premier Credit Card"
    Then the "$100 IHG Food & Beverage Rewards" perk should show 25 dollars per "qtr"
    And the "$100 IHG Food & Beverage Rewards" perk description should mention "expires at quarter end"
    And the "$100 Airline Statement Credit" perk description should mention "flight tickets of at least $250 booked directly with the airline"
    And the "$50 United TravelBank Cash" perk should show 25 dollars per "6mo"
    And the "$10 Monthly DoorDash Credit" perk description should mention "earlier activations receive $10 quarterly"
    And the "$10 Monthly Instacart Credit" perk should show 10 dollars per "mo"
    And the "$10 Monthly Instacart Credit" perk description should mention "active Instacart+ membership"

  Scenario: IHG airline credit expires permanently after 2027
    Given the perk calendar uses "America/New_York" at "2027-12-31T17:00:00Z"
    And I have added the "IHG One Rewards Premier Credit Card" card
    Then I should see "$100 Airline Statement Credit" in the perks list
    And the saved "ihg-premier-airline" perk count should be 1
    When the perk calendar advances to "2028-01-01T17:00:00Z"
    And the app refreshes expired perks
    And the app syncs catalog perks
    Then I should not see "$100 Airline Statement Credit" in the perks list
    And the saved "ihg-premier-airline" perk count should be 0

  Scenario: Amex Gold shows the current dining partners and prepaid hotel rate
    Given I am on the "Catalog" page
    When I click on the card "American Express Gold"
    Then I should see "Prepaid Hotels (Amex Travel)" earning rate with "5x"
    And the "$120 Dining Credits" perk description should mention "Buffalo Wild Wings"
    And the "$120 Dining Credits" perk description should mention "Wonder"

  Scenario: Platinum removes Saks and shows current credits and application fee limits
    Given I am on the "Catalog" page
    When I click on the card "American Express Platinum"
    Then I should not see "$100 Saks Fifth Avenue" perk
    And the "$219 CLEAR+ Credit" perk should show 219 dollars
    And the "$120 Global Entry/TSA PreCheck" perk description should mention "4.5 years"
    And the "$300 Digital Entertainment" perk description should mention "Paramount+"
    And the "$300 Digital Entertainment" perk description should mention "YouTube TV"

  Scenario: Blue Cash Preferred uses the monthly Disney streaming credit
    Given I am on the "Catalog" page
    When I click on the card "Amex Blue Cash Preferred"
    Then I should not see "$120 Equinox+ Credit" perk
    And I should not see "$84 Disney Bundle Credit" perk
    And the "$120 Disney Streaming Credit" perk should show 10 dollars per "mo"

  Scenario Outline: Delta cards include the domestic second checked bag
    Given I am on the "Catalog" page
    When I click on the card "<card>"
    Then the "First Checked Bag Free" perk description should mention "second checked bag free on domestic Delta flights"

    Examples:
      | card                       |
      | Delta SkyMiles Gold Amex    |
      | Delta SkyMiles Platinum Amex |
      | Delta SkyMiles Reserve Amex |

  Scenario: Delta Gold rideshare credit starts after renewal
    Given I am on the "Catalog" page
    When I click on the card "Delta SkyMiles Gold Amex"
    Then the "$120 Rideshare Credit" perk should show 10 dollars per "mo"
    And the "$120 Rideshare Credit" perk description should mention "after the first card renewal"
    And I should not see "~6-mo Uber One Credit" perk

  Scenario Outline: Capital One uses the current application fee reimbursement
    Given I am on the "Catalog" page
    When I click on the card "<card>"
    Then I should see "$120 Global Entry/TSA PreCheck" perk
    And I should not see "$100 Global Entry/TSA PreCheck" perk
    And the "$120 Global Entry/TSA PreCheck" perk description should mention "every 4 years"

    Examples:
      | card                  |
      | Capital One Venture   |
      | Capital One Venture X |

  Scenario: SKYPASS Select benefits reflect current issuer terms
    Given I am on the "Catalog" page
    When I click on the card "SKYPASS Select Visa Signature"
    Then I should see "60,000"
    And I should see "Other Airlines, Hotels & Rental Cars" earning rate with "2x"
    And the "$200 Annual Travel Credit" perk description should mention "directly with airlines, hotels, and car rental companies"
    And the "Priority Pass Select (4 Visits)" perk description should mention "shared with guests; enrollment required"
    And the "$50 In-Flight Duty-Free Coupons" perk description should mention "$50 minimum purchase per coupon"
    And the "Anniversary Bonus Miles" perk description should mention "plus 10,000 renewal bonus miles"
    And the "5% Korean Air Ticket Discount" perk description should mention "at account opening and each anniversary"
    And the "2 Korean Air Lounge Coupons" perk description should mention "when flying Korean Air"
    And I should not see "$100 Korean Air Ticket Coupon" perk

  Scenario: Amex Gold 60th anniversary Uber One credit expired
    Given I am on the "Catalog" page
    When I click on the card "American Express Gold"
    Then I should not see "$96 Uber One Membership Credit" perk

  Scenario: IHG One Rewards Credit Card launch bonus ends November 18, 2026
    Given I am on the "Catalog" page
    When I click on the card "IHG One Rewards Credit Card"
    Then the card requirements should mention "November 18, 2026"

  Scenario: IHG One Rewards Premier launch bonus ends November 18, 2026
    Given I am on the "Catalog" page
    When I click on the card "IHG One Rewards Premier Credit Card"
    Then the card requirements should mention "November 18, 2026"
