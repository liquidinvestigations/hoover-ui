import React from 'react'
import renderer from 'react-test-renderer'

import { CollectionsFilter } from '../src/components/search/filters/CollectionsFilter/CollectionsFilter'

xit('renders the collections box with a collection', () => {
    const tree = renderer
        .create(<CollectionsFilter classes={{}} selected={['testcollection']} collections={[{ name: 'testcollection', title: 'Test Collection' }]} />)
        .toJSON()

    expect(tree).toMatchSnapshot()
})

xit('renders a loading collections box', () => {
    const tree = renderer.create(<CollectionsFilter classes={{}} selected={[]} />).toJSON()

    expect(tree).toMatchSnapshot()
})
