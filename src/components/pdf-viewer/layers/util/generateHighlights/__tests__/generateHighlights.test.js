/**
 * @jest-environment jsdom
 */

import path from 'path'

import { generateHighlights, flattenDOMNodes } from '../index'

describe('PDF viewer utilities', () => {
    it('checks if all marks match the query', () => {
        for (let index = 1; index < 3; index++) {
            document.body.innerHTML = '' // reset document.body between files / use cases
            const fileContent = require('fs').readFileSync(path.join(__dirname, `./${index}.html`))
            document.body.innerHTML = fileContent

            const marks = generateHighlights([{ pageNum: 0, index: 0 }], document.body.children[0], 'metod', { pageNumber: 0 }, 0)

            for (const mark of marks) {
                expect(mark.toLowerCase()).toContain('metod')
            }
        }
    })

    it('checks if all marks match the query for multiple words', () => {
        document.body.innerHTML = '' // reset document.body between files / use cases
        const string = require('fs').readFileSync(path.join(__dirname, `./3.html`))
        document.body.innerHTML = string

        const nodes = flattenDOMNodes(document.body.children)
        const words = nodes
            .map((node) => node.innerHTML?.trim().split(/\s+/))
            .flat()
            .filter(Boolean)

        words.forEach((word) => {
            document.body.innerHTML = string // reset the content for each word
            const marks = generateHighlights([{ pageNum: 0, index: 0 }], document.body.children[0], word, { pageNumber: 0 }, 0)
            for (const mark of marks) {
                expect(mark.toLowerCase()).toContain(word.toLowerCase())
            }
        })
    })

    it('flattens DOM nodes correctly', () => {
        document.body.innerHTML = ''
        const div = document.createElement('div')
        const span1 = document.createElement('span')
        const span2 = document.createElement('span')
        div.append(span1, span2)
        document.body.append(div)

        const result = flattenDOMNodes(document.body.children)
        expect(result).toHaveLength(3)
    })
})
