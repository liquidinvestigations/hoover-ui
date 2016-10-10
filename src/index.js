import React from 'react'
import {render} from 'react-dom'
import SearchPage from './searchpage.js'
import DocPage from './docpage.js'

let rootNode = document.getElementById('app')

let page = (name) => {
  switch(name) {

    case 'search':
      return <SearchPage/>

    case 'doc':
      return <DocPage/>

    default:
      return <p>Unknown page: <tt>{name}</tt></p>

  }
}


render(page(HOOVER_UI_CONFIG.page), rootNode)
