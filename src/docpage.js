import React from 'react'

export default class DocPage extends React.Component {

  componentWillMount() {
    let dataUrl = `${window.location.href}/json`
    $.get(dataUrl, (doc) => {
      this.setState({doc})
    })
  }

  render() {
    let doc = (this.state || {}).doc
    if(! doc) return <p>loading...</p>

    return (
      <pre><code>{JSON.stringify(doc, null, 2)}</code></pre>
    )
  }

}
