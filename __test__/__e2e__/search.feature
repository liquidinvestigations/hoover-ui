Feature: Search page

  Scenario: Search for PDFs containing word "test"
    When I click testdata bucket
    When I click File Types category
    When I click File type filter
    When I click pdf bucket
    When I type test in search box
    When I click Search button
    Then I should see 2 results
