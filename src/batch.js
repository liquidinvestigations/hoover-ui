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
      query: query,
      batchOffset: 0,
      results: [],
      error: null,
    }, () => {
      this.batchSearch()
    })

  }

  batchSearch(success, error) {
    let offset = this.state.batchOffset
    let {terms, collections, batchSize} = this.state.query
    let termsPage = terms.slice(offset, offset + batchSize)
    $.ajax({
      url: '/batch',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        query_strings: termsPage,
        collections: collections,
      }),
      success: success,
      error: error,
      success: this.onResults.bind(this),
      error: this.onError.bind(this),
    })
  }

  onResults(resp) {
    if(resp.status == 'error') {
      return this.onError(resp)
    }

    var url = function (term) {
      var u = "./?q=" + encodeURIComponent(term)
      let collections = this.state.query.collections
      if (collections) {
        u += "&collections=" + collections.map(encodeURIComponent).join('+')
      }
      return u
    }.bind(this)

    let newResults = resp.responses.map((r) => {
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
      results: [].concat(this.state.results, newResults),
    })

    let offset = this.state.batchOffset
    let size = this.state.query.batchSize
    let nextOffset = offset + size

    if(nextOffset >= this.state.query.terms.length) {
      this.setState({
        searching: false
      })
    }
    else {
      this.setState({
        batchOffset: nextOffset,
      }, () => {
        this.batchSearch()
      })
    }
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
