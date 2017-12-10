var fs = require('fs')
var path = require('path')
var webpack = require('webpack')
var child_process = require('child_process')

var BUILD_DIR = path.resolve(__dirname, 'build')
var SRC_DIR = path.resolve(__dirname, 'src')

var useWatch = process.argv.indexOf('--watch') > -1

var WEBPACK_OPTIONS = {
  entry: SRC_DIR + '/index.js',
  output: {path: BUILD_DIR, filename: 'app.js'},
  devtool: '#source-map',
  module: {
    loaders: [
      {test: /\.js$/, include: SRC_DIR,
        loader: 'babel', query: {presets: 'latest,stage-3,react'}},
    ],
  },
  watch: useWatch,
}

function render(template, options) {
  return template.replace(/{{\s*([^\s{]+)\s*}}/g,
    function(_, name) { return options[name] })
}

webpack(WEBPACK_OPTIONS, function(err, stats) {
  if(err) { return console.error(err) }
  console.log(stats.toString("normal"))

  var timestamp = '' + new Date().getTime()
  for(let name of ['/index.html', '/batch.html', '/doc.html', '/terms.html']) {
    var src = fs.readFileSync(SRC_DIR + name, 'utf8')
    var output = render(src, {timestamp: timestamp})
    fs.writeFileSync(BUILD_DIR + name, output, 'utf8')
  }

  fs.writeFileSync(BUILD_DIR + '/style.css',
    fs.readFileSync(SRC_DIR + '/style.css'))

  child_process.execSync('cp -r assets/* build/')
})
