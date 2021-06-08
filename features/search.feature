Feature: Search page

  Scenario: Search for PDFs containing word "test"
    Given In Collections category and Collections filter I included testdata bucket
    Given In File Types category and File type filter I included pdf bucket
    When I search for test
    Then I should see 2 results
