import { search, searchFields, whoami } from '../../src/backend/api'
import getAuthorizationHeaders from '../../src/backend/getAuthorizationHeaders'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405)
        res.end()
    }

    try {
        const headers = getAuthorizationHeaders(req)
        const whoAmI = await whoami(headers)
        const fields = await searchFields(headers)
        const response = await search(headers, req.body, 'aggregations', fields.fields, whoAmI.username)
        res.json(response)
        res.end()

    } catch (e) {
        res.status(500)
        res.json(e)
        res.end()
    }
}
