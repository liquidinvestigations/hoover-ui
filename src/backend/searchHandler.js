import { search, searchFields, whoami } from './api'
import getAuthorizationHeaders from './getAuthorizationHeaders'

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405)
        res.end()
        return
    }

    try {
        const headers = getAuthorizationHeaders(req)
        const whoAmI = await whoami(headers)
        const fields = await searchFields(headers)
        const { type, fieldList, missing, refresh = '', async = false, ...params } = req.body
        const response = await search(headers, params, type, fieldList, missing, refresh, async, fields.fields, whoAmI.uuid)
        res.json(response)
        res.end()
    } catch (e) {
        res.status(e.status || 500)
        res.json(e)
        res.end()
    }
}

export default handler
