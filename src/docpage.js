import React from 'react'

export default class DocPage extends React.Component {

  componentWillMount() {
    let docUrl = window.location.href.split('?')[0]
    let dataUrl = `${docUrl}/json`
    $.get(dataUrl, (doc) => {
      this.setState({doc})
    })
  }


  render() {
    let doc = (this.state || {}).doc
    if(! doc) return <p>loading...</p>

    let files = doc.data.files && doc.data.files.map((item, index) => {
      return (
        <tr key={index}>
          <td>
            {item.id ?
              <a href={`./${item.id}`}>{item.filename}</a> :
              <span>{item.filename}</span>
            }
          </td>
          <td className="text-muted">{item.content_type}</td>
          <td>
            {item.id ?
              <a href={`./${item.id}/raw/`} title="Original file">
                <i className="fa fa-file-o"></i>
              </a> :
              <code>-- broken link --</code>}
          </td>
        </tr>
      )
    })


    return (
      <div className="card doc-page">
        <div className="card-block">
          <p className="card-title lead">#{doc.id}: {doc.data.filename}</p>
        </div>
        <p className="bg-faded text-uppercase doc-section-title">
          Meta</p>

        <div className="card-block">
          <table className="table table-sm">
            <tbody>
              <tr>
                <td>Path</td>
                <td><code>{doc.data.path}</code></td>
              </tr>
              <tr>
                <td>Filename</td>
                <td><code>{doc.data.filename}</code></td>
              </tr>
              {doc.data.type &&
                <tr>
                  <td>Type</td>
                  <td><code>{doc.data.type}</code></td>
                </tr>
              }
              {doc.data.type != 'folder' && doc.data.md5 &&
                <tr>
                  <td>MD5</td>
                  <td><code>{doc.data.md5}</code></td>
                </tr>
              }
              {doc.data.type != 'folder' && doc.data.sha1 &&
                <tr>
                  <td>SHA1</td>
                  <td><code>{doc.data.sha1}</code></td>
                </tr>
              }
              {doc.data.lang &&
                <tr>
                  <td>Language</td>
                  <td><code>{doc.data.lang}</code></td>
                </tr>
              }
              {doc.data['date-created'] &&
                <tr>
                  <td>Created</td>
                  <td>{doc.data['date-created']}</td>
                </tr>
              }
              {doc.data.date &&
                <tr>
                  <td>Modified</td>
                  <td>{doc.data.date}</td>
                </tr>
              }
            </tbody>
          </table>

          {doc.data.type == 'email' && (
            <table className="table table-sm">
              <tbody>
                <tr>
                  <td>From</td>
                  <td>{doc.data.from}</td>
                </tr>
                <tr>
                  <td>To</td>
                  <td>{doc.data.to.join(', ')}</td>
                </tr>
                <tr>
                  <td>Date</td>
                  <td>{doc.data.date}</td>
                </tr>
                <tr>
                  <td>Subject</td>
                  <td>{doc.data.subject}</td>
                </tr>
              </tbody>
            </table>
          )
         }
        </div>

        {doc.data.files &&
          <div>
            <p className="bg-faded text-uppercase doc-section-title">
              Files</p>
            <div className="card-block">
              <table className="table table-sm">
                <tbody>{files}</tbody>
              </table>
            </div>
          </div>
        }

      </div>
    )

  }

}
