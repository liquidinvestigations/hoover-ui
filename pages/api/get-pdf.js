import cache from 'memory-cache'
import * as pdfjs from 'pdfjs-dist/build/pdf'

import getAuthorizationHeaders from '../../src/backend/getAuthorizationHeaders'

pdfjs.GlobalWorkerOptions.workerSrc = '/tmp/pdf.worker.js'

export default async function handler(req, res) {
    const { API_URL } = process.env
    const { url } = req.query
    const headers = getAuthorizationHeaders(req)
    const cacheKey = `${url}-${JSON.stringify(headers)}`
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
        return res.status(200).json({ data: cachedData })
    }

    const response = await fetch(API_URL + url, { headers })

    if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} - ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()
    const loadingTask = pdfjs.getDocument({ data: buffer })

    loadingTask.promise.then(
        async (doc) => {
            const data = await extractTextContent(doc)

            cache.put(cacheKey, data, 180000) // cache for 3 mins

            res.status(200).json({ data })
        },
        (error) => {
            console.error(error)
            res.status(500).json({ error })
        }
    )
}

const extractTextContent = async (doc) => {
    const pagePromises = []

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
        const pagePromise = doc.getPage(pageNum).then(async (page) => {
            const textContent = await page.getTextContent()
            const text = textContent.items
                .map((item) => (item.hasEOL ? `${item.str} ` : item.str))
                .join('')
                .toLowerCase()
            return { pageNum, text }
        })
        pagePromises.push(pagePromise)
    }

    return await Promise.all(pagePromises)
}
