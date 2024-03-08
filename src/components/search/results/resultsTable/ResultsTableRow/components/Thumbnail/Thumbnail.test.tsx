import { act, fireEvent, render } from '@testing-library/react'

import { Hit } from '../../../../../../../Types'

import { Thumbnail } from './Thumbnail'

const mockHit: Hit = { _collection: 'test', _id: '1' } as Hit

describe('Thumbnail', () => {
    it('renders the visibility icon', () => {
        const { getByTestId } = render(<Thumbnail hit={mockHit} />)
        const icon = getByTestId('VisibilityIcon')
        expect(icon).toBeInTheDocument()
    })

    it('shows the Popper with loading state when the icon is hovered', () => {
        const { getByTestId, queryByRole } = render(<Thumbnail hit={mockHit} />)
        const icon = getByTestId('VisibilityIcon')
        fireEvent.mouseEnter(icon)
        expect(queryByRole('progressbar')).toBeInTheDocument()
    })

    it('hides the Popper when the icon is no longer hovered', async () => {
        const { getByTestId, queryByRole } = render(<Thumbnail hit={mockHit} />)
        const icon = getByTestId('VisibilityIcon')
        fireEvent.mouseEnter(icon)
        fireEvent.mouseLeave(icon)
        await act(() => new Promise((resolve) => setTimeout(resolve, 0))) // wait for updates
        expect(queryByRole('progressbar')).not.toBeInTheDocument()
    })

    it('shows the image and hides the loading state when the image is loaded', async () => {
        const { getByTestId, queryByRole, getByRole } = render(<Thumbnail hit={mockHit} />)
        const icon = getByTestId('VisibilityIcon')
        fireEvent.mouseEnter(icon)
        const img = getByRole('img')
        fireEvent.load(img)
        await act(() => new Promise((resolve) => setTimeout(resolve, 0))) // wait for updates
        expect(queryByRole('progressbar')).not.toBeInTheDocument()
        expect(img).toHaveAttribute('src', '/api/v1/doc/test/1/thumbnail/400.jpg')
    })
})
