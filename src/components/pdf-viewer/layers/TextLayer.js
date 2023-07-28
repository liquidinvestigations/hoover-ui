import { observer } from 'mobx-react-lite'
import { renderTextLayer } from 'pdfjs-dist/build/pdf'
import { useEffect, useRef } from 'react'
import { makeStyles } from 'tss-react/mui'

import { useSharedStore } from '../../SharedStoreProvider'

import { generateHighlights } from './util/generateHighlights'

const useStyles = makeStyles()(() => ({
    container: {
        '&.textLayer': {
            opacity: 1,

            '& ::selection': {
                background: 'rgb(0, 0, 255, 0.2)',
            },
        },
        '& mark': {
            color: 'inherit',
            borderTop: '1px solid orange',
            borderBottom: '1px solid orange',
            backgroundColor: 'rgb(255, 255, 0, 0.2)',
        },
        '& mark.active': {
            backgroundColor: 'rgb(255, 165, 0, 0.2)',
            borderTop: '1px solid red',
            borderBottom: '1px solid red',
        },
    },
}))

const TextLayer = observer(({ page, rotation, scale }) => {
    const { classes } = useStyles()
    const containerRef = useRef()
    const renderTask = useRef()
    const {
        documentStore: {
            documentSearchStore: {
                query,
                pdfSearchStore: { searchResults, currentHighlightIndex, scrollToHighlight },
            },
        },
    } = useSharedStore()

    const clear = () => {
        const container = containerRef.current
        if (!container) {
            return
        }
        while (container.firstChild) {
            container.firstChild.remove()
        }
    }

    const cancelTask = () => {
        if (renderTask.current) {
            renderTask.current.cancel()
        }
    }

    useEffect(() => {
        cancelTask()

        const container = containerRef.current
        const viewport = page.getViewport({ rotation, scale })

        page.getTextContent().then((textContent) => {
            clear()
            renderTask.current = renderTextLayer({
                container,
                textContent,
                viewport,
            })

            if (query && searchResults?.length) {
                renderTask.current.promise
                    .then(() => generateHighlights(searchResults, container, query, page, currentHighlightIndex))
                    .finally(() => scrollToHighlight(containerRef))
            }
        })

        return cancelTask
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rotation, scale, page, query, searchResults, currentHighlightIndex, scrollToHighlight])

    return <div ref={containerRef} className={classes.container + ' textLayer'} />
})

export default TextLayer
