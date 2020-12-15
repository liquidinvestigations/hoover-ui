import api from '../../src/backend/api'
import { authorizeBackendApi } from '../../src/utils'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.status(405)
        res.end()
    }

    try {
        authorizeBackendApi(req, api)
        const response = await api.whoami()
        res.json(response)
        res.end()

    } catch (e) {
        res.status(500)
        res.json(e)
        res.end()
    }
}
