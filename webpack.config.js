'use strict';

let path = require('path');
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let TransferWebpackPlugin = require('transfer-webpack-plugin');

let prod = process.env.NODE_ENV === 'production';
let isDevServer = process.argv.find(v => v.includes('webpack-dev-server'));
let hotLoading = (!prod && isDevServer) ? true : false;


const DIST_DIRECTORY = path.resolve(__dirname, 'dist');



let config = {
    bail: (prod ? true : false),
    context: __dirname,
    devServer: {
        historyApiFallback: true,
        hot: hotLoading,
        inline: true,
        stats: {assets: false, children: false, chunks: false, hash: false, version: false}
    },
    devtool: 'source-map', // @see https://webpack.js.org/configuration/devtool/
    entry: './src/main',
    output: {
        path: DIST_DIRECTORY,
        filename: 'bundle.[hash].js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: (function() {
                    let cssLoaderConfig = {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            url: false
                        }
                    };

                    if (hotLoading) {
                        return [{loader: 'style-loader'}, cssLoaderConfig];
                    } else {
                        return ExtractTextPlugin.extract({
                            fallback: 'style-loader',
                            use: cssLoaderConfig
                        });
                    }
                }())
            },
            {
                test: /\.(js|jsx)$/,
                use: (hotLoading ? ['react-hot-loader', 'babel-loader'] : ['babel-loader']),
                exclude: /node_modules/
            }
        ]
    },
    plugins: getPlugins(),
    resolve: {
        /*alias: {
            'react': 'preact-compat/dist/preact-compat.js',
            'react-dom': 'preact-compat/dist/preact-compat.js'
        },*/
        extensions: ['.js', '.jsx']
    }
};


function getPlugins() {
    let plugins = [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new TransferWebpackPlugin([
            {
                from: './assets',
                to: './assets'
            }
        ])
    ];

    if (prod) {
        plugins = plugins.concat([
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: true,
                minimize: true
            }),
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify('production')
                }
            })
        ]);
    }

    if (hotLoading) {
        plugins.push(new webpack.HotModuleReplacementPlugin());
    } else {
        plugins.push(new ExtractTextPlugin('styles.[contenthash].css'));
    }

    return plugins;
}


module.exports = config;
