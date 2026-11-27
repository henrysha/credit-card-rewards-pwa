Feature: iPhone Duo 4-Posture Responsive Design
  As an iPhone Duo user I want the Credit Card Rewards PWA to adapt across Folded Outer, Split View, Unfolded Portrait, and Unfolded Landscape postures without crease collisions or horizontal overflow

  Scenario: Web manifest unlocks orientation and matches dark theme
    Given I open the app
    Then the web app manifest should allow any orientation and use theme color "#0a0e1a"

  Scenario Outline: Compact postures (<posture>) use compact chrome, 44px touch targets, and focus-trapped dialogs without horizontal overflow
    Given I have added the "Chase Sapphire Reserve" card
    And I have added the "Chase Freedom Flex" card
    And the viewport is set to iPhone Duo "<posture>"
    When I navigate to the "Dashboard"
    Then the bottom navigation should have 5 items and compact height
    And I should see the dashboard quick jump pills
    And the best card rows should use compact height without horizontal overflow
    When I navigate to the "Perks"
    Then the perks page should display the compact period selector without horizontal overflow
    And the perk info button should meet the 44px minimum touch target
    When I view the card detail for "Chase Freedom Flex"
    Then the signup bonus edit button should meet the 44px minimum touch target
    When I open the card details editor via keyboard
    Then the dialog should have accessible name "Edit Card Details" and move focus inside the dialog
    And pressing Tab and Shift+Tab should stay trapped inside the dialog
    And the opening date and annual fee date fields should stack vertically
    When I press Escape to close the modal
    Then the modal should close and restore focus to "Edit card details"

    Examples:
      | posture      |
      | folded-outer |
      | split-view   |

  Scenario: Unfolded Portrait posture uses floating pill dock and 2-column grids
    Given I have added the "Chase Sapphire Reserve" card
    And I have added the "American Express Gold" card
    And the viewport is set to iPhone Duo "unfolded-portrait"
    When I navigate to the "Cards"
    Then the navigation bar should be a centered floating pill dock
    And the active cards list should render as a 2-column grid
    When I navigate to the "Catalog"
    Then the catalog list should render as a 2-column grid

  Scenario: Unfolded Landscape posture uses a 72px left navigation rail, viewport-centered 24px fold gap, and right-pane modals
    Given I have added the "Chase Sapphire Reserve" card
    And I have added the "American Express Gold" card
    And the viewport is set to iPhone Duo "unfolded-landscape"
    When I navigate to the "Dashboard"
    Then the navigation bar should be a 72px left vertical rail
    And the dashboard should render a 2-pane split with a 24px fold gap centered on the viewport
    When I view the card detail for "Chase Sapphire Reserve"
    Then I should see the wallet master list alongside the card detail pane with the fold gap centered on the viewport
    When I select "American Express Gold" from the wallet master list
    Then the card detail pane should display "American Express Gold" and receive keyboard focus
    When I open the card details editor
    Then the modal dialog should be positioned strictly on the right side of the viewport center fold

  Scenario: Unfolding and folding across the 780px breakpoint preserves open dialogs and unsaved draft state
    Given I have added the "Chase Sapphire Reserve" card
    And the viewport is set to iPhone Duo "unfolded-portrait"
    When I view the card detail for "Chase Sapphire Reserve"
    And I open the card details editor
    And I type "My Folded Draft Nickname" into the card nickname input without saving
    When the viewport is set to iPhone Duo "unfolded-landscape"
    Then the card details editor dialog should remain open with nickname draft "My Folded Draft Nickname"
    When the viewport is set to iPhone Duo "unfolded-portrait"
    Then the card details editor dialog should remain open with nickname draft "My Folded Draft Nickname"

  Scenario: Switching cards in the unfolded landscape wallet resets card-specific spend editors without leaking drafts
    Given I have added the "Chase Sapphire Reserve" card
    And I have added the "American Express Gold" card
    And the viewport is set to iPhone Duo "unfolded-landscape"
    When I view the card detail for "Chase Sapphire Reserve"
    And I open the inline bonus spend editor and type "4250" without saving
    And I select "American Express Gold" from the wallet master list
    Then the inline bonus spend editor should be closed
    And I should see "$0 / $8,000" spend progress

  Scenario: Pressing Escape with stacked dialogs closes only the topmost dialog and preserves the underlying draft
    Given I am browsing on Android
    And I have added the "Chase Sapphire Reserve" card
    When I view the card detail for "Chase Sapphire Reserve"
    And I open the card details editor
    And I type "Stacked Draft Nickname" into the card nickname input without saving
    And the PWA install prompt fires on top of the active dialog
    Then I should see the PWA installation guide
    When I press Escape to close the modal
    Then I should not see the PWA installation guide
    And the card details editor dialog should remain open with nickname draft "Stacked Draft Nickname"
    And focus should remain inside the "Edit Card Details" dialog

  Scenario: Closing a dialog opened from the Settings menu restores focus to the Settings trigger button
    Given I open the app
    When I open the "Request Feature" dialog from the Settings menu via keyboard
    Then the dialog should have accessible name "Submit Feature Request" and move focus inside the dialog
    When I press Escape to close the modal
    Then the modal should close and restore focus to "Settings"
