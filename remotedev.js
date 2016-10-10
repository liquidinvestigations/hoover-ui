let express = require('express')
let bodyParser = require('body-parser')
let request = require('request')

let BUILD = `${__dirname}/build`

let remote = process.argv[2]
let app = express()
app.use(bodyParser.json())

let proxyResponse = (res) => {
  return (err, upstream) => {
    if(err) { res.status(500); console.error(err); return }
    res.send(upstream.body)
  }
}

let proxyGet = (endpoint) => {
  app.get(endpoint, (req, res) => {
    let url = `${remote}${req.originalUrl}`
    request.get(url, {json: true}, proxyResponse(res))
  })
}

let proxyPost = (endpoint) => {
  app.post(endpoint, (req, res) => {
    let url = `${remote}${endpoint}`
    request.post(url, {json: true, body: req.body}, proxyResponse(res))
  })
}

proxyGet('/whoami')
proxyGet('/collections')

proxyPost('/search')
app.get(/^\/doc\/[^/]+\/[^/]+$/, (req, res) => {
  res.sendFile(`${BUILD}/doc.html`)
})
proxyGet('/doc/*')

app.use(express.static(BUILD))

app.listen(+(process.env.PORT || 8000), 'localhost')
