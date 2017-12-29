import React from 'react'
import Dropdown from './dropdown.js'
import Navbar from './navbar.js'
import CollectionsBox from './collections-box.js'
import Batch from './batch.js'
import parseQuery from './parseQuery.js'

class BatchPage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      terms: "",
      collections: null,
      selectedCollections: null,
      limits: null,
    }
  }

  componentDidMount() {
    this.getCollectionsAndLimits()
  }

  getCollectionsAndLimits() {
    $.get('/collections', function (resp) {
      this.setState({
        collections: resp,
        selectedCollections: resp.map((c) => c.name),
      })
    }.bind(this))

    $.get('/limits', function(resp) {
      this.setState({limits: resp})
    }.bind(this))
  }

  buildQuery(termsString, selectedCollections, batchSize) {
    if(! termsString.trim()) return null
    if(! selectedCollections.length) return null

    return {
      terms: termsString.trim().split('\n'),
      collections: selectedCollections,
      batchSize: batchSize,
    }
  }

  render() {
    if(! (this.state.collections && this.state.limits)) {
      return <p>loading ...</p>
    }

    let onChangeCollections = (selected) => {
      this.setState({selectedCollections: selected})
    }

    let collectionsValue = this.state.selectedCollections.join(' ')
    let {terms, collections, selectedCollections, limits} = this.state
    let batchSize = limits.batch
    let query = this.buildQuery(terms, selectedCollections, batchSize)

    let onSearch = (e) => {
      e.preventDefault()
      this.setState({
        terms: (this.refs.terms || {}).value || ""
      })
    }

    let limitsMessage = null
    if(limits && limits.requests) {
      let count = limits.batch * limits.requests.limit
      let timeout = limits.requests.interval
      limitsMessage = (
        <span className="batch-rate-limit-message">
          rate limit: {count} terms every {timeout} seconds
        </span>
      )
    }

    return (
      <form id="batch-form" ref="form">
        <input type="hidden" value={collectionsValue} />
        <div className="row">
          <div className="col-sm-2">
            <h1>Hoover</h1>
            <CollectionsBox
              collections={collections}
              selected={selectedCollections}
              onChange={onChangeCollections} />
          </div>
          <div className="col-sm-9">
            <div id="batch-input-box" className="form-group">
              <textarea
                id="batch-input-terms"
                ref="terms"
                className="form-control"
                rows="8"
                placeholder="search terms, one per line"
                ></textarea>
            </div>
            <div id="search-infotext" className="form-text text-muted">
              <p id="search-back">
                <a href="./">Back to single search</a>
              </p>
            </div>
            <div className="form-inline">
              <button className="btn btn-primary" onClick={onSearch}>
                Batch search
              </button>
              {limitsMessage}
            </div>
            <Batch query={query} />
          </div>
          <div className="col-sm-1">
            <Navbar />
          </div>
        </div>
      </form>
    )
  }
}

export default BatchPage
