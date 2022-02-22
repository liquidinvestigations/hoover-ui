const fs = require('fs')
const { API_URL, REWRITE_API } = process.env

const handler = async (req, res) => {
    try {
        const data = fs.readFileSync('./src/constants/map-data-v3.json')
        res.json(data.toString().replace('local:', REWRITE_API ? 'http://localhost:8000' : API_URL))
        res.end()

    } catch (e) {
        res.status(e.status || 500)
        res.json(e.message)
        res.end()
    }
}

export default handler
