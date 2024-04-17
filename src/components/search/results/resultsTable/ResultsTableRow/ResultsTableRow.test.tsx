import { Table, TableBody } from '@mui/material'
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '../../../../../../__test__/jest.utils'
import { ResultColumn } from '../../../../../constants/availableColumns'
import { SharedStore } from '../../../../../stores/SharedStore'
import { Hit } from '../../../../../Types'

import { ResultsTableRow } from './ResultsTableRow'
import { MAX_FILE_NAMES } from './ResultsTableRow.const'
import { mockHits, resultsColumnMocks } from './ResultsTableRow.mock'

let mockResultsColumns: [string, ResultColumn][]
const mockSetHashState: jest.Mock = jest.fn()
jest.mock('../../../../SharedStoreProvider', () => {
    const actual = jest.requireActual('../../../../SharedStoreProvider')
    return {
        ...actual,
        useSharedStore: jest.fn().mockImplementation(() => {
            const store = actual.useSharedStore() as SharedStore
            return {
                ...store,
                hashStore: { ...store.hashStore, setHashState: mockSetHashState },
                searchStore: {
                    ...store.searchStore,
                    query: { page: 1, size: 10 },
                    searchViewStore: { ...store.searchStore.searchViewStore, resultsColumns: mockResultsColumns },
                },
            }
        }),
    }
})

const renderWithTable = (children: React.ReactNode) => {
    renderWithProviders(
        <Table>
            <TableBody>{children}</TableBody>
        </Table>,
    )
}

xdescribe('ResultsTableRow', () => {
    it('should display table rows correctly', async () => {
        mockHits.forEach(async (hit, index) => {
            mockResultsColumns = resultsColumnMocks[index] as [string, ResultColumn][]
            renderWithTable(<ResultsTableRow hit={hit as unknown as Hit} index={index} />)

            expect(await screen.findByTestId('results-table-row')).toBeInTheDocument()
            expect(screen.getByLabelText('image')).toBeInTheDocument()
            expect(screen.getByTestId('VisibilityIcon')).toBeInTheDocument()
            hit._source.filename.slice(0, MAX_FILE_NAMES).forEach((filename) => {
                expect(screen.getByText(filename)).toBeInTheDocument()
            })
            expect(screen.getByLabelText('uploads')).toBeInTheDocument()
            expect(screen.getByLabelText('Open in new tab')).toBeInTheDocument()
            expect(screen.getByLabelText('Download original file')).toBeInTheDocument()
        })
    })

    it('should display thumbnail when hovering over visibility icon', async () => {
        renderWithTable(<ResultsTableRow hit={mockHits[0] as unknown as Hit} index={0} />)

        const visibilityIcon = await screen.findByTestId('VisibilityIcon')
        expect(visibilityIcon).toBeInTheDocument()
        fireEvent.mouseEnter(visibilityIcon)
        expect(screen.getByAltText('preview image')).toBeInTheDocument()
    })

    it('should have the correct href url for open in new tab', () => {
        renderWithTable(<ResultsTableRow hit={mockHits[0] as unknown as Hit} index={0} />)

        const openInNewTabButton = screen.getByLabelText('Open in new tab')
        const linkElement = openInNewTabButton.querySelector('a')

        expect(linkElement).toHaveAttribute('href', '/doc/uploads/b40ee8c9026260ffc5cbed7e686d6346eb1f2ff1e1b9424e50415d2eeb44b62e')
    })

    it('should have the correct href url for downloading file', () => {
        renderWithTable(<ResultsTableRow hit={mockHits[0] as unknown as Hit} index={0} />)
        const downloadButton = screen.getByLabelText('Download original file')
        const linkElement = downloadButton.querySelector('a')

        expect(linkElement).toHaveAttribute(
            'href',
            '/api/v1/doc/uploads/b40ee8c9026260ffc5cbed7e686d6346eb1f2ff1e1b9424e50415d2eeb44b62e/raw/page-004-154.png',
        )
    })

    it('should trigger document load on click', () => {
        renderWithTable(<ResultsTableRow hit={mockHits[0] as unknown as Hit} index={0} />)
        const tableRow = screen.getByTestId('results-table-row')
        expect(tableRow).toBeInTheDocument()
        fireEvent.click(tableRow)
        expect(mockSetHashState).toHaveBeenCalledWith({
            preview: { c: 'uploads', i: 'b40ee8c9026260ffc5cbed7e686d6346eb1f2ff1e1b9424e50415d2eeb44b62e' },
            tab: undefined,
            subTab: undefined,
            previewPage: undefined,
        })
    })
})
