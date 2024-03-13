import { render, screen, waitFor, fireEvent } from '@testing-library/react'

import { TypographyWithTooltip } from './TypographyWithTooltip'

describe('TypographyWithTooltip', () => {
    it('renders the value', () => {
        render(<TypographyWithTooltip value="Test value" />)
        expect(screen.getByText('Test value')).toBeInTheDocument()
    })

    it('does not show tooltip when value length is less than maxCharacters', () => {
        render(<TypographyWithTooltip value="Test" maxCharacters={10} />)
        fireEvent.mouseEnter(screen.getByText('Test'))
        expect(screen.queryByRole('tooltip')).toBeNull()
    })

    it('shows tooltip when value length is greater than maxCharacters', () => {
        render(<TypographyWithTooltip value="Long test value" maxCharacters={10} />)
        fireEvent.mouseEnter(screen.getByText('Long test value'))
        waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Long test value'))
    })

    it('applies the maxCharacters prop to the Typography component', () => {
        render(<TypographyWithTooltip value="Test value" maxCharacters={10} />)
        waitFor(() => expect(screen.getByText('Test value')).toHaveStyle('max-width: 10ch'))
    })
})
