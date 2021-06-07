import path from 'path'
import { config } from 'dotenv'
import React from 'react'
import { getPage } from 'next-page-tester'
import { screen } from '@testing-library/react'
import { fireEvent, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import router from 'next/router'
import { render } from '../testUtils'
import Index from '../../pages/index'

config({ path: path.resolve(process.cwd(), '.env.local') })

const collections = [{
    name: 'test-collection',
    stats: {
        progress_str: '100% processed, 0.00% errors'
    }
}]

describe('SearchPage', () => {
    it('should render the heading', async () => {
        document.cookie = process.env.OAUTH2_COOKIE
        const { render } = await getPage({ route: '/', useDocument: true })
        render()

        expect(screen.getByText(/Fuze Liquid Demo Site/i)).toBeInTheDocument()
    })

    it('should search all aggregations after selecting collection', async () => {
        document.cookie = process.env.OAUTH2_COOKIE
        const { render } = await getPage({ route: '/', useDocument: true })
        render()

        const collectionLabel = await screen.findByText('Language')
        fireEvent.click(collectionLabel)

        await waitFor(() => expect(collectionLabel.nextSibling).toBeTruthy())

        /*
        const collectionLabel = await screen.findByText('testdata')
        const collectionButton = collectionLabel.closest('.MuiButtonBase-root')

        expect(collectionButton.firstChild).not.toHaveClass('Mui-checked')

        fireEvent.click(collectionLabel)

        await waitFor(() => expect(collectionButton.firstChild).toHaveClass('Mui-checked'))

        expect(collectionButton.lastChild.firstChild).toHaveTextContent('479')
         */
    })
})
