const path = require('path')
const { merge } = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { EsbuildPlugin } = require('esbuild-loader')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

const common = require('./webpack.common.js')
const webpack = require('webpack')

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
            new webpack.EnvironmentPlugin({
                API_RETRY_DELAY_MIN: '{{API_RETRY_DELAY_MIN}}',
                API_RETRY_DELAY_MAX: '{{API_RETRY_DELAY_MAX}}',
                API_RETRY_COUNT: '{{API_RETRY_COUNT}}',

                ASYNC_SEARCH_POLL_SIZE: '{{ASYNC_SEARCH_POLL_SIZE}}',
                ASYNC_SEARCH_POLL_INTERVAL: '{{ASYNC_SEARCH_POLL_INTERVAL}}',
                ASYNC_SEARCH_ERROR_MULTIPLIER: '{{ASYNC_SEARCH_ERROR_MULTIPLIER}}',
                ASYNC_SEARCH_ERROR_SUMMATION: '{{ASYNC_SEARCH_ERROR_SUMMATION}}',

                HOOVER_MAPS_ENABLED: '{{HOOVER_MAPS_ENABLED}}',
                HOOVER_UPLOADS_ENABLED: '{{HOOVER_UPLOADS_ENABLED}}',
                HOOVER_TRANSLATION_ENABLED: '{{HOOVER_TRANSLATION_ENABLED}}',
            }),
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
