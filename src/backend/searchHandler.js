import { search, searchFields, whoami } from './api'
import getAuthorizationHeaders from './getAuthorizationHeaders'

const handler = type => async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405)
        res.end()
    }

    try {
        const headers = getAuthorizationHeaders(req)
        const whoAmI = await whoami(headers)
        const fields = await searchFields(headers)
        const response = await search(headers, req.body, type, fields.fields, whoAmI.uuid)
        res.json(response)
        res.end()

    } catch (e) {
        res.status(500)
        res.json(e)
        res.end()
    }
}

export default handler
