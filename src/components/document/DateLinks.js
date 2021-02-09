import React from 'react'
import Link from 'next/link'
import { useDocument } from './DocumentProvider'
import { useHashState } from '../HashStateProvider'
import { createSearchUrl } from '../../queryUtils'

export default function DateLinks({ field, term }) {
    const { hashState } = useHashState()
    const { collection, digest } = useDocument()

    const hash = { preview: { c: collection, i: digest }, tab: hashState.tab }

    return (
        <>
            Filter for this
            {' '}
            <Link href={createSearchUrl({ term, format: 'year' }, field, collection, hash)} shallow>
                <a>Year</a>
            </Link>
            {' / '}
            <Link href={createSearchUrl({ term, format: 'month' }, field, collection, hash)} shallow>
                <a>Month</a>
            </Link>
            {' / '}
            <Link href={createSearchUrl({ term, format: 'week' }, field, collection, hash)} shallow>
                <a>Week</a>
            </Link>
            {' / '}
            <Link href={createSearchUrl({ term, format: 'day' }, field, collection, hash)} shallow>
                <a>Day</a>
            </Link>
        </>
    )
}
