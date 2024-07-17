const dotenv = require('dotenv')
const path = require('path')
const { merge } = require('webpack-merge')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const common = require('./webpack.common.js')

dotenv.config({
    override: true,
})

module.exports = () =>
    merge(common, {
        mode: 'development',
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: `./src/index.ejs`,
                chunks: ['index'],
                filename: `index.html`,
            }),
            new webpack.HotModuleReplacementPlugin(),
        ],
        devtool: 'inline-source-map',
        entry: {
            index: ["webpack-hot-middleware/client?reload=true'", `./src/index.tsx`],
        },
        output: {
            clean: true,
            path: path.resolve(__dirname, `./dist`),
            publicPath: '/',
            filename: '[name].js',
        },
    })
