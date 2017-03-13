import React from 'react'

export default class Document extends React.Component {

  componentWillMount() {
    let docUrl = this.props.docUrl
    let split = docUrl.split('/')
    let docId = split.pop()

    this.baseUrl = split.join('/')

    if(window.HOOVER_HYDRATE_DOC) {
      this.setState({doc: window.HOOVER_HYDRATE_DOC, loaded: true})
    }
    else {
      $.get(`${docUrl}/json`, (doc) => {
        this.setState({doc: doc, loaded: true})
      })
    }
  }

  render() {
    let state = this.state || {}
    let doc = state.doc || {}
    let loaded = state.loaded
    let data = doc.content
    let files = doc.children || []
    let headerLinks = []

    if(!loaded) return <DocumentLoading />

    if(this.props.fullPage) {
      if(doc.parent_id) {
        headerLinks.push({
          href: `${this.props.collectionBaseUrl}${doc.parent_id}`,
          text: "Up",
          icon: 'fa fa-level-up',
        })
      }
    }
    else {
      headerLinks.push({
        href: `${this.props.docUrl}`,
        text: "Open in new tab",
        icon: 'fa fa-external-link-square',
        target: '_blank',
      })
    }

    let ocrData = Object.keys((data.ocrtext || {})).map((tag, index) => {
      return {tag: tag, text: data.ocrtext[tag]}
    })
    headerLinks.push(...ocrData.map(({tag}) => {
      return {
        href: `${this.props.docUrl}/ocr/${tag}/`,
        text: `OCR  ${tag}`,
        icon: 'fa fa-cloud-download',
      }
    }))

    return (
      <div className="card doc-page">

        <div className="lead">#{doc.id}: {data.filename}</div>
        <ul className="nav nav-inline">
          {headerLinks.map((props, index) =>
            <HeaderLink key={index} {... props} />
          )}
        </ul>

        <table className="table table-sm">
          <tbody>
            <tr>
              <td className="col">Institution</td>
              <td>{data.institution}</td>
            </tr>
            <tr>
              <td className="col">Title</td>
              <td>{data.title}</td>
            </tr>
            <tr>
              <td className="col">Type</td>
              <td>{data.type}</td>
            </tr>
            <tr>
              <td className="col">Date</td>
              <td>{data.date}</td>
            </tr>
            <tr>
              <td className="col">Description</td>
              <td>{data.description}</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

}

class DocumentLoading extends React.Component {

  render() {
    return (
      <div className="loading">
        <i className="fa fa-spinner loading-animate" aria-hidden="true"></i>
        <p><small>Loading</small></p>
      </div>
    )
  }

}

function HeaderLink({text, icon, ... props}) {
  return (
    <li className="nav-item">
      <a className="nav-link" {... props}>
        <i className={icon}></i>
        {text}
      </a>
    </li>
  )
}
