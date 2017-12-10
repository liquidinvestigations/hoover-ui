import React from 'react'
import Dropdown from './dropdown.js'
import Navbar from './navbar.js'
import CollectionsBox from './collections-box.js'
import Batch from './batch.js'
import parseQuery from './parseQuery.js'

class BatchPage extends React.Component {

  constructor(props) {
    super(props)
    var args = parseQuery(window.location.href)
    this.state = {
      terms: args.terms ? ("" + args.terms).replace(/\+/g, ' ') : "",
      args: args,
      collections: [],
      selectedCollections: [],
    }
  }

  componentDidMount() {
    this.getCollections()
  }

  getCollections() {
    $.get('/collections', function (resp) {
      var collections = resp
      var selectedCollections = null
      var args = this.state.args
      if (args.collections) {
        var sel = '' + args.collections
        selectedCollections = sel ? sel.split('+') : []
      }
      else {
        selectedCollections = resp.map((c) => c.name)
      }

      this.setState({
        collections,
        selectedCollections,
      })
    }.bind(this))
  }

  buildQuery(termsString, selectedCollections) {
    if(! termsString.trim()) return null
    if(! selectedCollections.length) return null

    return {
      terms: termsString.trim().split('\r\n'),
      collections: selectedCollections,
    }
  }

  render() {
    let refreshForm = () => {
      if(this.refs.terms.value)
        this.refs.form.submit()
    }

    let onChangeCollections = (selected) => {
      this.setState({selectedCollections: selected})
      setTimeout(refreshForm, 0)
    }

    let collectionsValue = this.state.selectedCollections.join(' ')
    let {terms, collections, selectedCollections} = this.state
    let query = this.buildQuery(terms, selectedCollections)

    return (
      <form id="batch-form" ref="form">
        <input type="hidden" name="collections" value={collectionsValue} />
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
                name="terms"
                className="form-control"
                rows="8"
                placeholder="search terms, one per line"
                defaultValue={terms}
                ></textarea>
            </div>
            <div id="search-infotext" className="form-text text-muted">
              <p id="search-back">
                <a href="./">Back to single search</a>
              </p>
            </div>
            <div className="form-inline">
              <button type="submit" className="btn btn-primary">
                Batch search
              </button>
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
