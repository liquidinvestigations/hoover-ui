import React from 'react'
import Dropdown from './dropdown.js'
import Navbar from './navbar.js'
import CollectionsBox from './collections-box.js'
import parseQuery from './parseQuery.js'

class BatchPage extends React.Component {

  constructor(props) {
    super(props)
    var args = parseQuery(window.location.href)
    this.state = {
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

  render() {
    let collectionsValue = this.state.selectedCollections.join(' ')

    return (
      <form id="batch-form" ref="form">
        <input type="hidden" name="collections" value={collectionsValue} />
        <div className="row">
          <div className="col-sm-2">
            <h1>Hoover</h1>
          </div>
          <div className="col-sm-9">
            (TODO batch input)
          </div>
          <div className="col-sm-1">
            <Navbar />
          </div>
        </div>
        <div className="row">
          <CollectionsBox
            collections={this.state.collections}
            selected={this.state.selectedCollections} />
        </div>
      </form>
    )
  }
}

export default BatchPage
