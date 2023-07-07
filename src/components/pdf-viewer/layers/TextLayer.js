import { observer } from 'mobx-react-lite'
import { renderTextLayer } from 'pdfjs-dist/build/pdf'
import { useEffect, useRef } from 'react'
import { makeStyles } from 'tss-react/mui'

import { useSharedStore } from '../../SharedStoreProvider'

const useStyles = makeStyles()(() => ({
    container: {
        '&.textLayer': {
            opacity: 1,
        },
        '& mark': {
            color: 'inherit',
            border: '1px solid orange',
            backgroundColor: 'rgb(255, 255, 0, 0.2)',
            
        },
        '& mark.active': {
            backgroundColor: 'rgb(255, 165, 0, 0.2)',
            border: '1px solid red',
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

    const generateHighlights = (container) => {
        let index = 0
        const currentPageSearchResults = searchResults.filter((match) => match.pageNum === page.pageNumber)
        if (!currentPageSearchResults.length) return
        Array.from(container?.children)?.forEach((node) => {
            if (node.textContent?.toLowerCase().includes(query)) {
                node.innerHTML = node.innerHTML.replace(new RegExp(query, 'gi'), (matched) => {
                    const matchedResult = `<mark ${
                        currentPageSearchResults[index].index === currentHighlightIndex ? `class="active"` : ''
                    }" id="highlight-${currentPageSearchResults[index].index}">${matched}</mark>`
                    index++
                    return matchedResult
                })
            }
        })
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
                renderTask.current.promise.then(
                    () => generateHighlights(container),
                    () => {}
                ).finally(() => scrollToHighlight(containerRef))
            }
        })

        return cancelTask
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rotation, scale, page, query, searchResults, currentHighlightIndex, scrollToHighlight])

    return <div ref={containerRef} className={classes.container + ' textLayer'} />
})

export default TextLayer
