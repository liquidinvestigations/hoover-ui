var path = require('path')
var webpack = require('webpack')
var CopyWebpackPlugin = require('copy-webpack-plugin')

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
  plugins: [
    new CopyWebpackPlugin([
        {from: 'src/index.html'},
        {from: 'src/doc.html'},
        {from: 'src/terms.html'},
        {from: 'src/style.css'},
        {from: 'assets'},
      ],
      {copyUnmodified: false})
  ],
  watch: useWatch,
}

webpack(WEBPACK_OPTIONS, function(err, stats) {
  if(err) { return console.error(err) }
  console.log(stats.toString("normal"))
})
