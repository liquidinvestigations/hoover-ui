import { fireEvent, screen, waitFor } from '@testing-library/react'

import { renderWithProviders } from '../../../../../__test__/jest.utils'
import { collections } from '../../../../backend/api'
import { CollectionData } from '../../../../Types'
import { formatThousands } from '../../../../utils/utils'

import { CollectionsFilter } from './CollectionsFilter'
import { collectionsData } from './CollectionsFilter.mock'

let mockCollectionsData: CollectionData[] | undefined = collectionsData
const mockCollectionsApi = collections as jest.MockedFunction<() => Promise<CollectionData[] | undefined>>
const mockFormatThousands = formatThousands as jest.MockedFunction<(number: number) => string>

jest.mock('../../../SharedStoreProvider', () => {
    const actual = jest.requireActual('../../../SharedStoreProvider')
    return {
        ...actual,
        useSharedStore: jest.fn().mockImplementation(() => {
            const store = actual.useSharedStore()
            return {
                ...store,
                collectionsData: mockCollectionsData,
                searchStore: {
                    ...store.searchStore,
                    searchResultsStore: { resultsCounts: { uploads: 1 } },
                },
            }
        }),
    }
})

jest.mock('../../../../backend/api', () => ({
    ...jest.requireActual('../../../../backend/api'),
    collections: jest.fn(),
}))

jest.mock('../../../../utils/utils', () => ({
    formatThousands: jest.fn(),
}))

describe('CollectionsFilter Component', () => {
    mockCollectionsApi.mockResolvedValue(collectionsData)
    it('renders the collections list', async () => {
        renderWithProviders(<CollectionsFilter />)

        const checkboxes = await screen.findAllByRole('button')
        expect(checkboxes).toBeDefined()
        expect(checkboxes.length).toBe(3)
    })

    it('toggles checkbox if checkbox within listitem is clicked', async () => {
        renderWithProviders(<CollectionsFilter />)

        const inactiveCheckBoxes: HTMLElement[] = await screen.findAllByTestId('CheckBoxOutlineBlankIcon')
        expect(inactiveCheckBoxes.length).toBe(3)

        inactiveCheckBoxes.forEach((item) => {
            fireEvent.click(item)
        })

        const checkedListItems: HTMLElement[] = await screen.findAllByTestId('CheckBoxIcon')
        expect(checkedListItems.length).toBe(3)
    })

    it('toggles checkbox if listitem is clicked', async () => {
        renderWithProviders(<CollectionsFilter />)

        const listItems: HTMLElement[] = await screen.findAllByRole('button')
        expect(listItems.length).toBe(3)

        listItems.forEach((listItem) => {
            fireEvent.click(listItem)
        })

        const checkedListItems: HTMLElement[] = await screen.findAllByTestId('CheckBoxIcon')
        const inactiveCheckBoxes = screen.queryAllByTestId('CheckBoxOutlineBlankIcon')
        expect(checkedListItems.length).toBe(3)
        expect(inactiveCheckBoxes.length).toBe(0)
    })

    it('calls formatThousands if there are search results for given collection', async () => {
        renderWithProviders(<CollectionsFilter />)
        await waitFor(() => {
            expect(mockFormatThousands).toHaveBeenCalled()
        })
    })

    it('renders no collections available when list is empty', () => {
        mockCollectionsData = []
        renderWithProviders(<CollectionsFilter />)

        const noCollectionsText = screen.getByText('no collections available')
        expect(noCollectionsText).toBeDefined()
    })

    it('renders loading state when collections list is undefined', () => {
        mockCollectionsData = undefined
        renderWithProviders(<CollectionsFilter />)

        const noCollectionsText = screen.getByRole('progressbar')
        expect(noCollectionsText).toBeDefined()
    })
})
