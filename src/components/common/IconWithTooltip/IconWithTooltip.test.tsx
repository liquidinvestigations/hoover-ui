import { render, screen, fireEvent } from '@testing-library/react'

import { IconWithTooltip } from './IconWithTooltip'

describe('IconWithTooltip', () => {
    it('shows tooltip with the correct value when hovered', async () => {
        render(<IconWithTooltip value="accountCircle" className="test-class" />)
        const icon = screen.getByLabelText('accountCircle')
        fireEvent.mouseEnter(icon)
        expect(await screen.findByRole('tooltip')).toHaveTextContent('accountCircle')
    })
})
