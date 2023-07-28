import { SearchResults } from '../../../../../stores/search/PdfSearchStore'

type Tuple = [number, number]

interface HighlightsData {
    matchedIndexes: number[]
    tuples: Tuple[]
}

export const flattenDOMNodes = (nodes: HTMLCollection): any[] => {
    const traverseNodes = (node: Node): any[] =>
        node.nodeType === Node.ELEMENT_NODE ? [node as any, ...Array.from(node.childNodes).flatMap((child) => traverseNodes(child))] : []

    return Array.from(nodes).flatMap((node) => traverseNodes(node))
}

export const generateHighlightsData = (nodes: any[], query: string): HighlightsData => {
    const queryLowerCase = query?.toLowerCase()
    const tuples: Tuple[] = []
    const matchedIndexes: number[] = []
    const textContent = nodes.reduce((prev, curr) => (prev += curr?.textContent?.toLowerCase() || ''), '')

    let startIndex = textContent.indexOf(queryLowerCase)

    while (startIndex !== -1) {
        matchedIndexes.push(startIndex)
        startIndex = String(textContent).indexOf(queryLowerCase, startIndex + 1)
    }

    nodes.forEach((node, i) => {
        Array.from(node.textContent).forEach((_, j) => {
            tuples.push([i, j])
        })
    })

    return { matchedIndexes, tuples }
}

const getMarkedTextLength = (text: string): number => {
    const markRegex = /<mark\b[^>]*>(.*?)<\/mark>/g
    const markedText = text.match(markRegex)
    if (markedText) {
        return markedText.reduce((totalLength, mark) => totalLength + mark.length, 0)
    }
    return 0
}

export const generateHighlights = (
    searchResults: SearchResults[],
    container: Element,
    query: string,
    page: any,
    currentHighlightIndex: number
): any[] => {
    if (!query) return []
    let highlighIndex = 0
    const currentPageSearchResults = searchResults.filter((match) => match.pageNum === page.pageNumber)
    if (!currentPageSearchResults.length) return []

    const nodes = flattenDOMNodes(container.children)
    const { matchedIndexes, tuples } = generateHighlightsData(nodes, query)
    if (!matchedIndexes.length) return []

    const createMark = (text: string): string =>
        `<mark ${currentPageSearchResults[highlighIndex]?.index === currentHighlightIndex ? 'class="active"' : ''} id="highlight-${
            currentPageSearchResults[highlighIndex]?.index
        }">${text}</mark>`

    return matchedIndexes.map((index) => {
        let mark = ''
        const firstLetter = tuples[index]
        const lastLetter = tuples[index + query?.length - 1]
        const [spanStart, charStart] = firstLetter
        const [spanEnd, charEnd] = lastLetter
        if (spanStart === spanEnd) {
            const currentNode = nodes[spanStart]
            mark = currentNode.textContent.substring(charStart, charEnd + 1)
            currentNode.innerHTML = String(currentNode.textContent).replace(mark, (matched) => createMark(matched))
        } else {
            for (let i = spanStart; i <= spanEnd; i++) {
                let multiSpanMark = ''
                const currentNode = nodes[i]
                const markTextLength = getMarkedTextLength(currentNode.innerHTML)
                const charStart2 = markTextLength ? charStart + markTextLength - 1 : charStart
                switch (i) {
                    case spanStart:
                        multiSpanMark = currentNode.innerHTML.substring(charStart2)
                        currentNode.innerHTML = currentNode.innerHTML.substring(0, charStart2) + createMark(multiSpanMark)
                        break
                    case spanEnd:
                        multiSpanMark = currentNode.innerHTML.substring(0, charEnd + 1)
                        currentNode.innerHTML = createMark(multiSpanMark) + currentNode.innerHTML.substring(charEnd + 1)
                        break

                    default:
                        multiSpanMark = currentNode.innerHTML.substring(0, currentNode.innerHTML.length)
                        currentNode.innerHTML = createMark(multiSpanMark)
                        break
                }
                mark += multiSpanMark
            }
        }
        highlighIndex++
        return mark
    })
}
