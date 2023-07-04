import { IncomingMessage } from 'http'

import { search, searchFields, whoami } from './api'
import { SearchFields } from './buildSearchQuery'
import getAuthorizationHeaders from './getAuthorizationHeaders'

import type { NextApiRequest, NextApiResponse } from 'next'

export const searchHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.status(405)
        res.end()
        return
    }

    try {
        const headers = getAuthorizationHeaders(req as IncomingMessage)
        const whoAmI = (await whoami(headers)) as { uuid: string }
        const fields = (await searchFields(headers)) as { fields: SearchFields }
        const { type, fieldList, missing, refresh = '', async = false, ...params } = req.body
        const response = await search(headers, params, type, fieldList, missing, refresh, async, fields.fields, whoAmI.uuid)
        res.json(response)
        res.end()
    } catch (e: any) {
        res.status(e.status || 500)
        res.json(e)
        res.end()
    }
}
