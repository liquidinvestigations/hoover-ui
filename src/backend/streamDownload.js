import https from 'https'

let index = 0

export default function streamDownload(url, req, res) {
    return new Promise((resolve, reject) => {
        const apiHost = new URL(process.env.API_URL).host

        https.get({
            hostname: apiHost,
            path: url,
            port: 443,
            headers: {
                'Cookie': req.headers.cookie,
                ...Object.fromEntries(
                    Object.keys(req.headers)
                        .filter(key => key.startsWith('x-forwarded'))
                        .map(key => [key, req.headers[key]])
                )
            }
        }, resp => {
            Object.entries(resp.headers).forEach(([header, value]) => {
                res.setHeader(header, value)
            })

            resp.on('end', () => {
                resolve()
            })

            resp.pipe(res, { end: true })

        }).on('error', () => {
            res.status(500)
            res.end()
            reject()
        })
    })
}
