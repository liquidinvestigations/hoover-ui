import React from 'react'

export default class DocPage extends React.Component {

  componentWillMount() {
    let docUrl = this.props.docUrl || window.location.href.split('?')[0]
    let split = docUrl.split('/'),
        docId = split.pop(),
        baseUrl = split.join('/')
    this.baseUrl = baseUrl

    $.get(`${docUrl}/json`, (doc) => {
      this.setState({doc: doc, loaded: true})
    })
  }

  render() {
    let state = this.state || {},
        doc = state.doc || {},
        loaded = state.loaded
    let data = doc.content,
        files = doc.children || []

    if(!loaded) return <DocLoading />

    return (
      <div className="card doc-page">

        <div className="lead">#{doc.id}: {data.filename}</div>

        <div className="bg-faded doc-section-title">Meta</div>

        <table className="table table-sm">
          <tbody>
            <tr>
              <td style={{width: 110}}>Path</td>
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

        <DocEmailSection doc={doc} />
        <DocFilesSection title="Files" data={files} baseUrl={this.baseUrl} />
        <DocTextSection data={doc.content.text} title="Text" />
        <DocTextSection data={doc.content.tree} title="Headers &amp Parts"/>
      </div>
    )

  }

}

class DocEmailSection extends React.Component {

  render() {
    let doc = this.props.doc || {},
        data = doc.content,
        files = doc.children || []

    return data.type == 'email' && (
      <div>
        <p className="bg-faded doc-section-title">Email</p>
        <table className="table table-sm">
          <tbody>
            <tr><td>From</td> <td>{data.from}</td></tr>
            <tr><td>To</td> <td>{data.to.join(', ')}</td></tr>
            <tr><td>Date</td> <td>{data.date}</td></tr>
            <tr><td>Subject</td> <td>{data.subject || '---'}</td></tr>
          </tbody>
        </table>
      </div>
    )
  }

}

class DocFilesSection extends React.Component {

  render() {
    let files = this.props.data.map((item, index) => {
      return (
        <tr key={index}>
          <td>
            {item.id ?
              <a href={`${this.props.baseUrl}/${item.id}`}>{item.filename}</a> :
              <span>{item.filename}</span>
            }
          </td>
          <td className="text-muted">{item.content_type}</td>
          <td className="text-muted">{item.size}</td>
          <td>
            {item.id ?
              <a href={`${this.props.baseUrl}/${item.id}/raw/`}
                  title="Original file">
                <i className="fa fa-file-o"></i>
              </a> :
              <code>-- broken link --</code>}
          </td>
        </tr>
      )
    })

    return files.length > 0 && (
      <div>
        <p className="bg-faded doc-section-title">{this.props.title}</p>
        <table className="table table-sm">
          <tbody>{files}</tbody>
        </table>
      </div>
    )
  }

}


class DocTextSection extends React.Component {

  render() {
    let data = this.props.data
    if(!data) return <div></div>

    let expanded = (this.state || {}).expanded,
        text = data.replace(/ /g,''),
        title = this.props.title

    if(text.length <= 700) {
      expanded = true
    }

    return (
      <div>
        <div className="bg-faded doc-section-title">{title}</div>
        <div className="content">
          {expanded ? <pre>{text}</pre> :
           <pre className="content-wrap"
                onClick={() => {this.setState({expanded: true})}}>
              {text}
            </pre>
          }
        </div>
      </div>
    )
  }

}

class DocLoading extends React.Component {

  render() {
    return (
      <div className="iframe-loading">
        <i className="fa fa-spinner loading-animate" aria-hidden="true"></i>
        <p><small>Loading</small></p>
      </div>
    )
  }

}
