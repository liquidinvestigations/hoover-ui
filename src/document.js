import React from 'react'

export default class Document extends React.Component {

  componentWillMount() {
    let docUrl = this.props.docUrl
    let split = docUrl.split('/')
    let docId = split.pop()

    this.baseUrl = split.join('/')

    $.get(`${docUrl}/json`, (doc) => {
      this.setState({doc: doc, loaded: true})
    })
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

    if(data.type != 'folder') {
      headerLinks.push({
        href: `${this.props.docUrl}/raw/${data.filename}`,
        text: `Original file`,
        icon: 'fa fa-cloud-download'
      })
    }

    let ocrData = Object.keys((data.ocr || {})).map((tag, index) => {
      return {tag: tag, text: data.ocr[tag]}
    })
    headerLinks.push(...ocrData.map(({tag}) => {
      return {
        href: `${this.props.docUrl}/ocr/${tag}/`,
        text: `OCR  ${tag}`,
        icon: 'fa fa-cloud-download'
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

        <div className="bg-faded doc-section-title">Meta</div>

        <table className="table table-sm">
          <tbody>
            <tr>
              <td className="col">Path</td>
              <td><code>{data.path}</code></td>
            </tr>
            <tr>
              <td>Filename</td>
              <td><code>{data.filename}</code></td>
            </tr>
            {data.type &&
              <tr>
                <td>Type</td>
                <td><code>{data.type}</code></td>
              </tr>
            }
            {data.type != 'folder' && data.md5 &&
              <tr>
                <td>MD5</td>
                <td><code>{data.md5}</code></td>
              </tr>
            }
            {data.type != 'folder' && data.sha1 &&
              <tr>
                <td>SHA1</td>
                <td><code>{data.sha1}</code></td>
              </tr>
            }
            {data.lang &&
              <tr>
                <td>Language</td>
                <td><code>{data.lang}</code></td>
              </tr>
            }
            {data['date-created'] &&
              <tr>
                <td>Created</td>
                <td>{data['date-created']}</td>
              </tr>
            }
            {data.date &&
              <tr>
                <td>Modified</td>
                <td>{data.date}</td>
              </tr>
            }
            {data.pgp &&
              <tr>
                <td>PGP</td>
                <td>{data.pgp}</td>
              </tr>
            }
          </tbody>
        </table>

        <DocumentEmailSection doc={doc} />
        <DocumentFilesSection title="Files"
                              data={files} baseUrl={this.baseUrl}
                              fullPage={this.props.fullPage}
                              />
        <DocumentTextSection title="Text"
                             text={doc.content.text} />
        <DocumentTextSection title="Headers &amp; Parts"
                             text={doc.content.tree} />
        {ocrData.map(({tag, text}) =>
          <DocumentTextSection title={tag} text={text} />
        )}
      </div>
    )
  }

}

class DocumentEmailSection extends React.Component {

  render() {
    let doc = this.props.doc || {}
    let data = doc.content
    let files = doc.children || []

    if(data.type == 'email') {
      return (
        <div>
          <p className="bg-faded doc-section-title">Email</p>
          <table className="table table-sm">
            <tbody>
              <tr><td>From</td><td>{data.from}</td></tr>
              <tr><td>To</td><td>{data.to.join(', ')}</td></tr>
              <tr><td>Date</td><td>{data.date}</td></tr>
              <tr><td>Subject</td><td>{data.subject || '---'}</td></tr>
            </tbody>
          </table>
        </div>
      )
    }
    return null
  }

}

class DocumentFilesSection extends React.Component {

  render() {
    let {data, baseUrl, title, fullPage} = this.props
    let files = data.map(({id, filename, content_type, size}, index) => {
      return (
        <tr key={index}>
          <td>
            {id
              ? (
                <a href={`${baseUrl}/${id}`}
                  target={fullPage ? null : '_blank'}
                  >{filename}</a>
              )
              : <span>{filename}</span>
            }
          </td>
          <td className="text-muted">{content_type}</td>
          <td className="text-muted">{size}</td>
          <td>
            {id
              ? (
                <a href={`${baseUrl}/${id}/raw/${filename}`}
                  target={fullPage ? null : '_blank'}
                  title="Original file">
                  <i className="fa fa-file-o"></i>
                </a>
              )
              : <code>-- broken link --</code>}
          </td>
        </tr>
      )
    })

    return files.length > 0 && (
      <div>
        <p className="bg-faded doc-section-title">{title}</p>
        <table className="table table-sm">
          <tbody>{files}</tbody>
        </table>
      </div>
    )
  }

}

class DocumentTextSection extends React.Component {

  render() {
    let text = this.props.text
    if(!text) return null

    let expanded = (this.state || {}).expanded
    let title = this.props.title

    if(text.length <= 700) {
      expanded = true
    }

    return (
      <div>
        <div className="bg-faded doc-section-title">{title}</div>
        <div className="content">
          {expanded
           ? <pre>{text}</pre>
           : <pre className="content-wrap"
                  onClick={() => {this.setState({expanded: true})}}>
              {text}
            </pre>
          }
        </div>
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
      <i className={icon}></i>
      <a className="nav-link" {... props}>{text}</a>
    </li>
  )
}
