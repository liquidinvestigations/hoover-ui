import React from 'react'

class Batch extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      searching: false,
      error: null,
      results: null,
      query: null
    }
  }

  performSearch(query) {
    if(!query) {
      return
    }
    if (this.state.query === query) {
      return
    }

    this.setState({
      searching: true,
      query: query
    })

    this.search(
      query,
      this.onResults.bind(this),
      this.onError.bind(this))
  }

  search(query, success, error) {
    $.ajax({
      url: '/batch',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        query_strings: query.terms,
        collections: query.collections,
      }),
      success: success,
      error: error,
    })
  }

  onResults(resp) {
    if(resp.status == 'error') {
      return this.onError(resp)
    }
    this.setState({
      searching: false
    })

    var url = function (term) {
      var u = "./?q=" + encodeURIComponent(term)
      let collections = this.state.query.collections
      if (collections) {
        u += "&collections=" + collections.map(encodeURIComponent).join('+')
      }
      return u
    }.bind(this)

    let results = resp.responses.map((r) => ({
      term: r._query_string,
      count: r.hits.total,
      url: url(r._query_string),
    }))

    this.setState({
      results: results,
      error: null
    })
  }

  onError(err) {
    console.error(err)
    this.setState({
      searching: false,
      results: null,
      error: err.reason || "Unknown server error while searching"
    })
  }

  componentDidMount() {
    this.performSearch(this.props.query)
  }

  componentWillReceiveProps(props) {
    this.performSearch(props.query)
  }

  render() {
    let resultList = null

    if(this.state.results) {
      resultList = (
        <ul id="results">
          {(this.state.results).map((result) =>
            <li key={result.url}>
              <h3>
                <a href={result.url}>
                  {result.term}
                </a>
                <span className="">
                  {result.count} hits
                </span>
              </h3>
            </li>
          )}
        </ul>
      )
    }

    return (
      <div className="batch-results col-sm-10">
        {resultList}
      </div>
    )
  }

}

export default Batch
