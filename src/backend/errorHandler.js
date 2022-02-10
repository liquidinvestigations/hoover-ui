const handler = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405)
        res.end()
        return
    }

    try {
        console.log(req.body)
        res.end()

    } catch (e) {
        res.status(e.status || 500)
        res.json(e)
        res.end()
    }
}

export default handler
