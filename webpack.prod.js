const path = require('path')
const { merge } = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { EsbuildPlugin } = require('esbuild-loader')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

const common = require('./webpack.common.js')

module.exports = () =>
    merge(common, {
        mode: 'production',
        optimization: {
            minimizer: [
                new EsbuildPlugin({
                    target: 'esnext', // Syntax to compile to
                }),
                new CssMinimizerPlugin(),
            ],
        },
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader'],
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: `src/index.ejs`,
            }),
            new MiniCssExtractPlugin({
                ignoreOrder: true,
                filename: '[name].css',
            }),
        ],
        entry: {
            index: ['./src/index.tsx'],
        },
        output: {
            clean: true,
            publicPath: `/`,
            path: path.resolve(__dirname, `./out`),
        },
    })
