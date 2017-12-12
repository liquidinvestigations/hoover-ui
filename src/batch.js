import React from 'react'
import classNames from 'classnames'

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

  performBatchSearch(query) {
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

    this.batchSearch(
      query,
      this.onResults.bind(this),
      this.onError.bind(this))
  }

  batchSearch(query, success, error) {
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

    let results = resp.responses.map((r) => {
      let rv = {
        term: r._query_string,
        url: url(r._query_string),
      }
      if(r.error) {
        console.error(r.error)
        rv.error = true
      }
      else {
        rv.count = r.hits.total
      }
      return rv
    })

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
    this.performBatchSearch(this.props.query)
  }

  componentWillReceiveProps(props) {
    this.performBatchSearch(props.query)
  }

  render() {
    let renderResult = ({url, term, error, count}) => {
      let result
      if(error) {
        result = <span className="batch-results-result error-result">error</span>
      }
      else {
        result = <span className="batch-results-result">{count} hits</span>
      }

      return (
        <li key={url} className={classNames({'no-hits': count == 0})}>
          <h3>
            <a href={url} className="batch-results-link">
              {result}
              {term}
            </a>
          </h3>
        </li>
      )
    }

    let resultList = null
    if(this.state.results) {
      resultList = (
        <ul id="batch-results">
          {(this.state.results).map(renderResult)}
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
