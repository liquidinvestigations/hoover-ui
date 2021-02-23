import React from 'react'
import { Paper, Toolbar } from '@material-ui/core'
import { useDocument } from './DocumentProvider'

export default function Document({ initialPage, onPageChange }) {
    const { doc } = useDocument()
    const { numPages } = doc || {}

    return (
        <>
            <Toolbar>

            </Toolbar>
            {Array(numPages).map((_, index) =>
                <Paper key={index}>

                </Paper>
            )}
        </>
    )
}
