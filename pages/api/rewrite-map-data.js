const fs = require('fs')
const { REWRITE_API } = process.env

const handler = async (req, res) => {
    try {
        const data = fs.readFileSync('./src/constants/map-data-v3.json')
        const parts = req.headers.referer.split('://')
        res.json(data.toString().replace('local:', parts[0] + '://' + parts[1].split('/')[0] ))
        res.end()

    } catch (e) {
        res.status(e.status || 500)
        res.json(e.message)
        res.end()
    }
}

export default handler
