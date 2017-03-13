import React from 'react'
import url from 'url'

import Charts from './charts.js'
import Document from './document.js'


function timeMs() {
  return new Date().getTime()
}

class ResultItem extends React.Component {

  viewUrl(item) {
    return 'doc/' + item._collection + '/' + item._id
  }

  render() {
    let {hit} = this.props
    let fields = hit.fields || {}
    let highlight = hit.highlight || {}
    var url = this.viewUrl(hit)

    var attachIcon = null
    if (fields.hasOwnProperty('attachments') && fields.attachments[0]) {
      attachIcon = <i className="fa fa-paperclip" aria-hidden="true"></i>
    }

    var title = fields.title
    var text = fields.description[0] || fields.title[0]
    if (highlight) {
      let hiData = highlight.title || highlight.description
      if (hiData) {
        text = hiData.map((hi, n) =>
          <li key={`${hit._url}${n}`}>
            <span dangerouslySetInnerHTML={{__html: hi}}/>
          </li>
        )
      }
    }

    var word_count = null;
    if (fields["word-count"] && fields["word-count"].length == 1) {
      word_count = fields["word-count"][0] + " words";
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
          {this.props.n}.
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
        <p className='results-item-path'>{fields.path}</p>
        <p className='results-item-word-count'>{word_count}</p>
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
    var start = 1 + (this.props.page - 1) * this.props.pagesize
    var resultList = this.props.hits.map((hit, i) =>
      <ResultItem
        key={hit._url}
        hit={hit}
        n={start + i}
        onPreview={(url) => {
          this.setState({preview: url})
        }}
        />
    )

    var results = null
    if (this.props.hits.length > 0) {
      results = <ul id="results"> {resultList} </ul>
    } else {
      results = <p>-- no results --=</p>
    }
    let preview = (this.state || {}).preview
    let previewUrl = preview && url.resolve(window.location.href, preview)

    return (
      <div className='results-wrapper'>
        <div className='row'>
          <div className='col-sm-4'>
            <div className='results-search'>
              <Charts {... this.props} />
              { this.renderPageController() }
              { results }
              { this.renderPageController() }
            </div>
          </div>
          {preview &&
            <div className='col-sm-8' key={previewUrl}>
              <div className='results-preview'>
                <Document
                  docUrl={previewUrl}
                  collectionBaseUrl={url.resolve(previewUrl, './')}
                  />
              </div>
            </div>
          }
        </div>
      </div>
    )
  }

}

export default Results
