import url from 'url'
import React from 'react'
import Document from './document.js'
import Locations from './locations.js'
import parseQuery from './parseQuery.js'


export default class DocPage extends React.Component {

    render() {
        let docUrl = window.location.href.split('?')[0]
        let query = parseQuery(window.location.href)

        if(query.locations) {
          return (
            <Locations
              docUrl={docUrl}
              />
          )
        }

        return (
          <Document
            docUrl={docUrl}
            collectionBaseUrl={url.resolve(docUrl, './')}
            fullPage={true}
            />
        )
    }

}
