import type { NextApiRequest, NextApiResponse } from 'next'

export const errorHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        res.status(405)
        res.end()
        return
    }

    try {
        console.log(req.body)
        res.end()
    } catch (e: any) {
        res.status(e.status || 500)
        res.json(e)
        res.end()
    }
}
