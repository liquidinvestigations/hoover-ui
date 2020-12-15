import api from '../../../../../../src/backend/api'
import streamDownload from '../../../../../../src/backend/streamDownload'

export const config = {
    api: {
        bodyParser: false,
    },
}

export default function handler(req, res) {
    if (req.method !== 'GET') {
        res.status(405)
        res.end()
    }

    if (!req.headers.cookie) {
        res.status(401)
        res.end()
    }

    const { collection, id, filename } = req.query
    const url = api.downloadUrl(`/doc/${collection}/${id}`, encodeURIComponent(filename))

    return streamDownload(url, req, res)
}
