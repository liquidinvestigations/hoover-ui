import React from 'react'
import Dropdown from './dropdown.js'
import Navbar from './navbar.js'
import CollectionsBox from './collections-box.js'
import Search from './search.js'

const sizeOptions = [10, 50, 200, 1000]
const orderOptions = ['Relevance', 'Newest', 'Oldest']
const SEARCH_GUIDE = 'https://github.com/hoover/search/wiki/Guide-to-search-terms'

class SearchPage extends React.Component {

  parseQuery(url) {
    var rv = {}
    if (url.indexOf('?') > -1) {
      url.match(/\?(.*)/)[1].split('&').forEach(function (pair) {
        var kv = pair.split('=').map(decodeURIComponent)
        var k = kv[0], v = kv[1]
        if (!rv[k]) {
          rv[k] = []
        }
        rv[k].push(v)
      })
    }
    return rv
  }

  constructor(props) {
    super(props)
    var args = this.parseQuery(window.location.href)
    this.state = {
      q: args.q ? ("" + args.q).replace(/\+/g, ' ') : "",
      size: args.size ? +args.size : 10,
      order: args.order ? args.order[0] : orderOptions[0],
      args: args,
      collections: [],
      selectedCollections: [],
      query: null,
      page: '',
    }
  }

  componentDidMount() {
    this.getCollections()
  }

  getCollections() {
    $.get('/collections', function (resp) {
      var collections = resp
      var selectedCollections = null
      var query = null
      var args = this.state.args
      if (args.collections) {
        var sel = '' + args.collections
        selectedCollections = sel ? sel.split('+') : []
      }
      else {
        selectedCollections = resp.map(function (c) {
          return c.name
        })
      }

      if (this.state.q) {
        query = {
          q: this.state.q,
          collections: selectedCollections,
          page: args.p ? +args.p : 1,
          size: this.state.size,
          order: this.state.order,
        }
      }

      this.setState({
        collections,
        selectedCollections,
        query,
      })
    }.bind(this))
  }

  render() {
    return (
      <form id="search-form" ref="form">
        <div className="row">
          <div className="col-sm-3">
            <h1>Hoover</h1>
          </div>
          <div className="col-sm-8">
            <div id="search-input-box" className="form-group">
              <i className="fa fa-search" />
              <input name="q" defaultValue={this.state.q}
                   type="search"
                   className="form-control"
                   placeholder="Search..."/>
              <p id="search-guide" className="form-text text-muted">
                Refine your search using this handy{' '}
                <a href={SEARCH_GUIDE}>guide</a>.
              </p>
            </div>
            <div className="form-inline">
              <div className="form-group">
                <Dropdown
                  name="size"
                  values={sizeOptions}
                  value={this.state.size}
                  onChanged={() => { this.refs.form.submit() }}
                  />
                </div>
              <div className="form-group">
                <Dropdown
                  name="order"
                  values={orderOptions}
                  value={this.state.order}
                  onChanged={() => { this.refs.form.submit() }}
                />
              </div>{' '}
              <button type="submit">search</button>
            </div>
          </div>
          <div className="col-sm-1">
            <Navbar />
          </div>
        </div>
        <div className="row">
          <CollectionsBox
            collections={this.state.collections}
            selected={this.state.selectedCollections}
            onChanged={(selected) => this.setState({selectedCollections: selected})} />
          <Search
            query={this.state.query}
            collections={this.state.selectedCollections} />
        </div>
      </form>
    )
  }
}

export default SearchPage
