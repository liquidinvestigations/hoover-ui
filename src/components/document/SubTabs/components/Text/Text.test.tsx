import { screen } from '@testing-library/react'

import { renderWithProviders } from '../../../../../../__test__/jest.utils'

import { Text } from './Text'

describe('Text Component', () => {
    it('renders "No text" when content is empty', async () => {
        renderWithProviders(<Text content="" />)
        const noTextElement = await screen.findByText('No text')
        expect(noTextElement).toBeInTheDocument()
    })

    it('renders content when it is provided', () => {
        const testContent = 'Test content'
        renderWithProviders(<Text content={testContent} />)
        const contentElement = screen.getByText(testContent)
        expect(contentElement).toBeInTheDocument()
    })

    test('escapes HTML special characters in content', () => {
        const unsafeContent = '<script>alert("XSS")</script>'
        const escapedContent = '&lt;script&gt;alert("XSS")&lt;/script&gt;'
        const { container } = renderWithProviders(<Text content={unsafeContent} />)
        expect(container.children[0].innerHTML).toContain(escapedContent)
        expect(container.innerHTML).not.toContain(unsafeContent)
    })
})
