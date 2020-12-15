import https from 'https'

export default function streamDownload(url, cookie, res) {
    return new Promise((resolve, reject) => {
        const apiHost = new URL(process.env.API_URL).host

        https.get({
            hostname: apiHost,
            path: url,
            port: 443,
            headers: {
                'Cookie': cookie
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
