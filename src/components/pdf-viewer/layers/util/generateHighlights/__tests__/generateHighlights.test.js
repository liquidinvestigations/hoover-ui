/**
 * @jest-environment jsdom
 */

import path from 'path'

import { generateHighlights, flattenDOMNodes, getTextContent, getMatchedIndexes } from '../index'

describe('PDF viewer utilities', () => {
    it('checks if all marks match the query for multiple words in each file', () => {
        const files = ['1.html', '2.html', '3.html']

        files.forEach((fileName) => {
            const wordsSet = new Set()
            document.body.innerHTML = '' // reset document.body between files / use cases
            const fileContent = require('fs').readFileSync(path.join(__dirname, `./${fileName}`))
            document.body.innerHTML = fileContent

            const nodes = flattenDOMNodes(document.body.children[0].children)
            const textContent = getTextContent(nodes)
            const words = textContent
                .split(' ')
                .slice(0, 50)
                .filter((word) => word?.length > 3)
            words.forEach((word) => wordsSet.add(word.toLowerCase()))

            const uniqueWords = Array.from(wordsSet) // unique word set converted to array

            expect(uniqueWords.length).toBeGreaterThanOrEqual(10)

            uniqueWords.forEach((word) => {
                const marks = generateHighlights([{ pageNum: 0, index: 0 }], document.body.children[0], word)
                const matchedIndexes = getMatchedIndexes(textContent, word.toLowerCase())

                expect(matchedIndexes.length).toBe(marks.length)

                for (const mark of marks) {
                    expect(mark.toLowerCase()).toBe(word.toLowerCase())
                }

                document.body.innerHTML = fileContent
            })
        })
    })

    it('flattens DOM nodes correctly', () => {
        document.body.innerHTML = ''
        const div = document.createElement('div')
        const span1 = document.createElement('span')
        const span2 = document.createElement('span')
        span1.append(span2)
        div.append(span1)
        document.body.append(div)

        const result = flattenDOMNodes(document.body.children)
        expect(result).toHaveLength(3)
    })
})
