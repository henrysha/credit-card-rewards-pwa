Feature: PWA installation guide
  As a mobile browser user
  I want platform-specific installation instructions
  So that I can install the application on my home screen

  Scenario: Show iOS installation instructions in a browser
    Given I am browsing on an iPhone
    When I load the application in the browser
    Then I should see the PWA installation guide
    And I should see the iOS installation instructions

  Scenario: Show Android installation instructions in a browser
    Given I am browsing on Android
    When I load the application in the browser
    Then I should see the PWA installation guide
    And I should see the Android installation instructions

  Scenario: Hide the installation guide when the PWA is installed
    Given I am browsing on an iPhone
    And the application is running as an installed PWA
    When I load the application in the browser
    Then I should not see the PWA installation guide

  Scenario: Hide the installation guide on an unsupported platform
    Given I am browsing on a desktop computer
    When I load the application in the browser
    Then I should not see the PWA installation guide
