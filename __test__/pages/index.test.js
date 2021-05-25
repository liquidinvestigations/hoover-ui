import React from 'react'
import { screen } from '@testing-library/react'
import { customRender } from '../testUtils'
import Index from '../../pages/index'

const collections = [{
    name: 'test',
    stats: {
        progress_str: '100% processed, 0.00% errors'
    }
}]

describe('SearchPage', () => {
    it('should render the heading', () => {
        customRender(<Index collections={collections} />)

        const heading = screen.getByText(/Test liquid title/i)

        expect(heading).toBeInTheDocument()
    })
})
