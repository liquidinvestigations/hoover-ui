import url from 'url'
import React from 'react'
import Document from './document.js'


export default class DocPage extends React.Component {

    render() {
        let docUrl = window.location.href.split('?')[0]
        return (
          <Document
            docUrl={docUrl}
            collectionBaseUrl={url.resolve(docUrl, './')}
            fullPage={true}
            />
        )
    }

}
