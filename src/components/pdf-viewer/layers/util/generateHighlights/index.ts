import { SearchResults } from '../../../../../stores/search/PdfSearchStore'

// This type represents a tuple with two numbers, used to store the start and end positions of text content.
type Tuple = [number, number]
const BR_NODE_NAME = 'BR'

// This function flattens the DOM nodes into an array, including nested nodes.
export const flattenDOMNodes = (nodes: HTMLCollection): any[] => {
    const traverseNodes = (node: Node): any[] =>
        node.nodeType === Node.ELEMENT_NODE ? [node as any, ...Array.from(node.childNodes).flatMap((child) => traverseNodes(child))] : []

    return Array.from(nodes).flatMap((node) => traverseNodes(node))
}

// This function finds all matched indexes of the search query within the given text content.
export const getMatchedIndexes = (textContent: string, query: string): number[] => {
    const matchedIndexes: number[] = []
    let startIndex = textContent.indexOf(query)

    while (startIndex !== -1) {
        matchedIndexes.push(startIndex)
        startIndex = String(textContent).indexOf(query, startIndex + 1)
    }

    return matchedIndexes
}

// This function generates an array of tuples representing positions in the flattened DOM nodes.
export const getTuples = (nodes: any[]): Tuple[] => {
    const tuples: Tuple[] = []

    nodes.forEach((node, i) => {
        if (node.nodeName === BR_NODE_NAME) tuples.push([i, 0])
        Array.from(node.innerHTML).forEach((_, j) => {
            tuples.push([i, j])
        })
    })

    return tuples
}

// This function gets the text content of flattened DOM nodes and converts it to lowercase.
export const getTextContent = (nodes: any[]) =>
    nodes.reduce((prev, curr) => {
        if (curr.nodeName === BR_NODE_NAME) return (prev += ' ')
        return (prev += curr?.innerHTML?.toLowerCase() || '')
    }, '')

// This function calculates the length of any existing "mark" tags in the provided text.
export const getMarkedTagLength = (text: string): number => {
    const markRegex = /<mark\b[^>]*>|<\/mark>/g
    const markedText = text.match(markRegex)
    if (markedText) {
        return markedText.join('').length
    }
    return 0
}

// This function adds the "active" class to the appropriate "mark" tags based on the currentHighlightIndex.
export const addActiveClassToMarks = (container: Element, currentHighlightIndex: number): void => {
    const markTags = container.querySelectorAll('mark')
    markTags.forEach((markTag) => {
        const index = parseInt(markTag.getAttribute('id')?.split('-')[1] || '', 10)
        if (index === currentHighlightIndex) {
            markTag.classList.add('active')
        } else {
            markTag.classList.remove('active')
        }
    })
}

// This function creates the mark tag for query highlighting
export const createMark = (text: string, index: number): string => `<mark id="highlight-${index}">${text}</mark>`

// This function generates the highlights for the search results on the current page, and returns a string array of all marks
export const generateHighlights = (currentPageSearchResults: SearchResults[], container: Element, query: string): string[] => {
    let highlightIndex = 0
    const nodes = flattenDOMNodes(container.children)
    const textContent = getTextContent(nodes)
    const matchedIndexes = getMatchedIndexes(textContent, query.toLowerCase())
    const tuples = getTuples(nodes)

    if (!matchedIndexes.length) return []

    return matchedIndexes.map((index) => {
        let mark = ''
        const firstLetter = tuples[index]
        const lastLetter = tuples[index + query?.length - 1]
        const [spanStart, charStart] = firstLetter
        const [spanEnd, charEnd] = lastLetter

        // If the matched text is contained within a single node.
        if (spanStart === spanEnd) {
            const currentNode = nodes[spanStart]
            const markTextLength = getMarkedTagLength(currentNode.innerHTML)

            // Calculate the start and end positions of the marked text.
            const charStartWithMark = markTextLength > 0 ? charStart + markTextLength : charStart
            const charEndWithMark = markTextLength > 0 ? charEnd + markTextLength + 1 : charEnd + 1

            // Extract the marked text from the current node.
            mark = currentNode.innerHTML.substring(charStartWithMark, charEndWithMark)

            // Replace the current node's innerHTML with the marked text.
            currentNode.innerHTML =
                currentNode.innerHTML.substring(0, charStartWithMark) +
                createMark(mark, currentPageSearchResults[highlightIndex]?.index) +
                currentNode.innerHTML.substring(charEndWithMark)
        } else {
            // If the matched text spans multiple nodes.
            for (let i = spanStart; i <= spanEnd; i++) {
                let multiSpanMark = ''
                const currentNode = nodes[i]
                const markTextLength = getMarkedTagLength(currentNode.innerHTML)

                switch (i) {
                    // For the starting node of the matched text.
                    case spanStart:
                        multiSpanMark = currentNode.innerHTML.substring(charStart + markTextLength)
                        currentNode.innerHTML =
                            currentNode.innerHTML.substring(0, charStart + markTextLength) +
                            createMark(multiSpanMark, currentPageSearchResults[highlightIndex]?.index)
                        break
                    // For the ending node of the matched text.
                    case spanEnd:
                        multiSpanMark = currentNode.innerHTML.substring(0, charEnd + 1)
                        currentNode.innerHTML =
                            createMark(multiSpanMark, currentPageSearchResults[highlightIndex]?.index) + currentNode.innerHTML.substring(charEnd + 1)
                        break
                    // For the nodes in between the starting and ending nodes of the matched text.
                    default:
                        multiSpanMark = currentNode.innerHTML.substring(0, currentNode.innerHTML.length)
                        currentNode.innerHTML = createMark(multiSpanMark, currentPageSearchResults[highlightIndex]?.index)
                        break
                }

                mark += multiSpanMark
            }
        }

        // Move to the next highlight index.
        highlightIndex++

        // Return the generated marked text for the current matched index.
        return mark
    })
}
