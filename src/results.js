import url from 'url'
import React from 'react'
import Charts from './charts.js'

function timeMs() {
  return new Date().getTime()
}

function Preview({url}) {
  let embedUrl = `${url}?embed=on`
  return (
    <iframe className='results-item-preview' src={embedUrl} />
  )
}

class ResultItem extends React.Component {

  viewUrl(item) {
    return 'doc/' + item._collection + '/' + item._id
  }

  render() {
    let {hit} = this.props
    var url = this.viewUrl(hit)

    var attachIcon = null
    if (hit.fields.hasOwnProperty('attachments') && hit.fields.attachments[0]) {
      attachIcon = <i className="fa fa-paperclip" aria-hidden="true"></i>
    }

    var title = hit.fields.filename
    var text = null
    if (hit.highlight) {
      if (hit.highlight.text) {
        text = hit.highlight.text.map((hi, n) =>
          <li key={`${hit._url}${n}`}>
            <span dangerouslySetInnerHTML={{__html: hi}}/>
          </li>
        )
      }
    }

    return (
      <li className="results-item" key={hit._url}
        onMouseDown={() => {
          this.willFocus = ! (this.tUp && timeMs() - this.tUp < 300)
        }}
        onMouseMove={() => {
          this.willFocus = false
        }}
        onMouseUp={() => {
          if(this.willFocus) {
            this.tUp = timeMs()
            this.props.onPreview(url)
          }
        }}
        >
        <h3>
          <a href={url} target="_blank"
            onClick={(e) => {
              let modifier = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
              if(! modifier) {
                e.preventDefault()
                this.props.onPreview(url)
              }
            }}
            >{attachIcon} {title}</a>
        </h3>
        <p className='results-item-path'>{hit.fields.path}</p>
        <ul className="results-highlight">
          { text }
        </ul>
      </li>
    )
  }

}

/**
 * Props:
 *
 * collections
 * prev_url
 * next_url
 * counts
 * page
 * page_count
 * total
 * hits
 * pagesize
 */
class Results extends React.Component {

  collectionTitle(name) {
    var col = this.props.collections.find(function (c) {
      return c.name == name
    })
    if (col) {
      return col.title
    }
    return name
  }

  renderPageController() {
    var prevUrl = null
    if (this.props.prev_url) {
      prevUrl = <a className="btn btn-secondary-outline btn-sm" href={this.props.prev_url}>&laquo;</a>
    }

    var nextUrl = null
    if (this.props.next_url) {
      nextUrl = <a className="btn btn-secondary-outline btn-sm" href={this.props.next_url}>&raquo;</a>
    }

    var countByIndex = null
    if (this.props.collections && this.props.counts) {
      var indexCounts = this.props.collections.map((col) => {
          if (this.props.counts.hasOwnProperty(col)) {
            return (
              <span key={col}>
                <b>{this.collectionTitle(col)}</b>{' '}
                {this.props.counts[col]}
                <span className="comma">, </span>
              </span>
            )
          } else {
            return null
          }
        }
      )

      countByIndex = (
        <span className="count_by_index">
          ({indexCounts}){' '}
          (page {this.props.page}/{this.props.page_count})
        </span>
      )
    }

    return (
      <p>
        {prevUrl}{' '}
        {this.props.total} hits{' '}
        {countByIndex}{' '}
        {nextUrl}
      </p>
    )
  }

  render() {
    var resultList = this.props.hits.map((hit) =>
      <ResultItem
        key={hit._url}
        hit={hit}
        onPreview={(url) => {
          this.setState({preview: url})
        }}
        />
    )

    var results = null
    if (this.props.hits.length > 0) {
      var start = 1 + (this.props.page - 1) * this.props.pagesize
      results = <ol id="results" start={start}> {resultList} </ol>
    } else {
      results = <p>-- no results --=</p>
    }

    let preview = (this.state || {}).preview

    return (
      <div>
        <Charts {... this.props} />
        <div className='row'>
          <div className='col-sm-4'>
            { this.renderPageController() }
            { results }
            { this.renderPageController() }
          </div>
          {preview &&
            <div className='col-sm-8'>
              <Preview url={url.resolve(window.location.href, preview)} />
            </div>
          }
        </div>
      </div>
    )
  }

}

export default Results
