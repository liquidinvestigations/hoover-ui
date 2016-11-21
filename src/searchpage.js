import React from 'react'
import Dropdown from './dropdown.js'
import Navbar from './navbar.js'
import CollectionsBox from './collections-box.js'
import Search from './search.js'

const sizeOptions = [10, 50, 200, 1000]
const SEARCH_GUIDE = 'https://github.com/hoover/search/wiki/Guide-to-search-terms'

export const SORT_RELEVANCE = 'Relevance'
export const SORT_NEWEST = 'Newest'
export const SORT_OLDEST = 'Oldest'
export const SORT_OPTIONS = [SORT_RELEVANCE, SORT_NEWEST, SORT_OLDEST]

function parseQuery(url) {
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

class SearchPage extends React.Component {

  constructor(props) {
    super(props)
    var args = parseQuery(window.location.href)
    this.state = {
      q: args.q ? ("" + args.q).replace(/\+/g, ' ') : "",
      size: args.size ? +args.size : 10,
      order: args.order ? args.order[0] : SORT_OPTIONS[0],
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
        selectedCollections = resp.map((c) => c.name)
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
    let refreshForm = () => {
      if(this.refs.q.value)
        this.refs.form.submit()
    }

    let onChangeCollections = (selected) => {
      this.setState({selectedCollections: selected})
      setTimeout(refreshForm, 0)
    }

    let collectionsValue = this.state.selectedCollections.join(' ')

    return (
      <form id="search-form" ref="form">
        <input type="hidden" name="collections" value={collectionsValue} />

        <div className="header">
          <div className="row">
            <div className="col-sm-2">
              <h1>Hoover</h1>
            </div>
            <div className="col-sm-9">
              <div id="search-input-box" className="form-group">
                <i className="fa fa-search" />
                <input
                  ref='q'
                  name="q"
                  defaultValue={this.state.q}
                  type="search"
                  className="form-control"
                  placeholder="Search..."
                  />
                <p id="search-guide" className="form-text text-muted">
                  Refine your search using{' '}
                  <a href={SEARCH_GUIDE}>this handy guide</a>.
                </p>
              </div>
              <div className="form-inline row">
                <div className="form-group col-sm-4">
                  <Dropdown
                    name="size"
                    label="Results per page"
                    values={sizeOptions}
                    value={this.state.size}
                    onChange={refreshForm}
                    />
                </div>{' '}
                <div className="form-group col-sm-4">
                  <Dropdown
                    name="order"
                    label="Sort by"
                    values={SORT_OPTIONS}
                    value={this.state.order}
                    onChange={refreshForm}
                  />
                </div>{' '}
                <button type="submit">search</button>
              </div>
            </div>
            <div className="col-sm-1">
              <Navbar />
            </div>
          </div>
        </div>

        <div className="results-content">
          <div className="row">
            <CollectionsBox
              collections={this.state.collections}
              selected={this.state.selectedCollections}
              onChange={onChangeCollections} />
            <Search
              query={this.state.query}
              collections={this.state.selectedCollections}
              onSelect={(data) => {
                for(let key of Object.keys(data)) {
                  this.refs.q.value += ` ${key}:${data[key]}`
                }
                refreshForm()
              }}
              />
          </div>
        </div>

      </form>
    )
  }
}

export default SearchPage
