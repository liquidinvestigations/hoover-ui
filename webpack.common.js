require('dotenv').config()
const path = require('path')

const webpack = require('webpack')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const Dotenv = require('dotenv-webpack')

module.exports = {
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.(jpg|svg|png|webp|lottie|ogg|m4a|mp3|ac3|webm)$/,
                type: 'asset/resource',
            },
            {
                test: /\.(tsx|jsx)$/,
                exclude: /node_modules/,
                loader: 'esbuild-loader',
                options: {
                    loader: 'tsx',
                    target: 'esnext',
                    jsx: 'automatic',
                },
            },
            {
                test: /\.(ts|js)$/,
                exclude: /node_modules/,
                loader: 'esbuild-loader',
                options: {
                    loader: 'ts',
                    target: 'esnext',
                },
            },
        ],
    },
    plugins: [
        new Dotenv(),
        new LodashModuleReplacementPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: './node_modules/pdfjs-dist/cmaps',
                    to: './static/cmaps',
                },
                {
                    from: './node_modules/pdfjs-dist/web/images/annotation-*',
                    to: './static/media/annotation/[name].[ext]',
                },
                {
                    from: './node_modules/pdfjs-dist/build/pdf.worker.js',
                    to: './static/pdf.worker.js',
                },
                {
                    from: './nginx-routes.conf',
                    to: './nginx-routes.conf',
                },
            ],
        }),
    ],
    resolve: {
        extensions: ['*', '.mjs', '.js', '.jsx', '.ts', '.tsx'],
        fallback: {
            events: require.resolve('events'),
        },
    },
    output: {
        clean: true,
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js',
        assetModuleFilename: 'assets/[name].[hash][ext][query]',
    },
}
