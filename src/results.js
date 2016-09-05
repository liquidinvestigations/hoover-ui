import React from 'react'

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

  viewUrl(item) {
    return 'doc/' + item._collection + '/' + item._id
  }

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
              <span>
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

  renderSearchHit(hit) {

    var url = this.viewUrl(hit)

    var attachIcon = null
    if (hit.fields.hasOwnProperty('attachments') && hit.fields.attachments[0]) {
      attachIcon = <i className="fa fa-paperclip" aria-hidden="true"></i>
    }

    var title = (hit.fields.path||[])[0] || hit.fields.title
    var text = null
    if (hit.highlight) {
      if (hit.highlight.text) {
        text = hit.highlight.text.map((hi) =>
          <li>
            <span dangerouslySetInnerHTML={{__html: hi}}/>
          </li>
        )
      }
    }

    return (
      <li className="results-item" key={hit._id}>
        <a href={ url } target="_blank">
          <h3>
            { attachIcon }{' '}
            { title } (#{hit._id}){' '}
            {hit.fields.rev && (
              <span>
              ({hit.fields.rev})
              </span>
            )}
          </h3>
          <ul className="results-highlight">
            { text }
          </ul>
        </a>
      </li>
    )
  }

  render() {
    var resultList = this.props.hits.map((hit) => this.renderSearchHit(hit))

    var results = null
    if (this.props.hits.length > 0) {
      var start = 1 + (this.props.page - 1) * this.props.pagesize
      results = <ol id="results" start={start}> {resultList} </ol>
    } else {
      results = <p>-- no results --=</p>
    }

    return (
      <div>
        { this.renderPageController() }
        { results }
      </div>
    )
  }

}

export default Results
