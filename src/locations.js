import url from 'url'
import React from 'react'


export default class Locations extends React.Component {

  constructor(props) {
    super()
    this.state = {}

    let {docUrl} = props
    $.get(`${docUrl}/locations`, (resp) => {
      let {locations} = resp
      console.log('locations:', locations)
      this.setState({locations})
    })

    if(window.HOOVER_HYDRATE_DOC) {
      this.state.doc = window.HOOVER_HYDRATE_DOC
    }
    else {
      $.get(`${docUrl}/json`, (doc) => {
        this.setState({doc: doc})
      })
    }
  }

  render() {
    let {doc, locations} = this.state

    let docUrl = this.props.docUrl
    let baseUrl = url.resolve(docUrl, './')
    console.log('baseUrl:', baseUrl)

    console.log('render', doc, locations)

    if(doc && locations) {
      let locationItem = (loc, index) => {
        let parentUrl = `${baseUrl}${loc.parent_id}`

        return (
          <li key={index}>
            <a href={parentUrl}>{loc.parent_path}</a>/{loc.filename}
          </li>
        )
      }

      return (
        <div className="card doc-page">

          <div className="lead">#{doc.id}</div>

          <ul className="list-unstyled content">
            {locations.map(locationItem)}
          </ul>

        </div>
      )
    }

    else {
      return <p>loading...</p>
    }
  }

}
