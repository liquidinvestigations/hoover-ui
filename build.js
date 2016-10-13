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
  module: {
    loaders: [
      {test: /\.js$/, include: SRC_DIR, loader: 'babel'},
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

  var t = '' + new Date().getTime()
  for(let name of ['/index.html', '/doc.html', '/terms.html']) {
    var data = render(fs.readFileSync(SRC_DIR + name, 'utf8'), {t: t})
    fs.writeFileSync(BUILD_DIR + name, data, 'utf8')
  }

  fs.writeFileSync(BUILD_DIR + '/style.css',
    fs.readFileSync(SRC_DIR + '/style.css'))

  child_process.execSync('cp -r assets/* build/')
})
