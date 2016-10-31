const path = require('path');
const pkg = require('./package.json');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');

module.exports = {
    context: path.join(__dirname, 'src'),
    entry: {
        js: './client/app.js',
        vendor: ['jquery', 'weui.js', 'fastclick']
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
            }, {
                test: /\.less$/,
                exclude: /node_modules/,
                //loader: 'style!css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!less'
                loader: 'style!css!postcss!less'
            }, {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style', 'css', 'postcss')
            }
            ,{
                test: /\.(png|jpe?g|gif|svg)$/i,
                exclude: /node_modules/,
                loader: 'file'
                //loader: "file-loader?name=img/img-[hash:6].[ext]"
            }
        ]
    },
    postcss: [autoprefixer],
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    plugins: [
        new webpack.DefinePlugin({
            VERSION: pkg.version,
            DEBUG: true || process.env.NODE_ENV !== 'production'
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new webpack.optimize.CommonsChunkPlugin(/* chunkName= */'vendor', /* filename= */'vendor.bundle.js'),
        //new webpack.optimize.UglifyJsPlugin({
        //    compress: {
        //        warnings: false
        //    }
        //}),
        new ExtractTextPlugin('style.css'),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/client/index.html')
        }),
        new OpenBrowserPlugin({url: 'http://localhost:8080'})
    ],
    devServer: {
        contentBase: './dist',
        hot: true
        //open: 'http://localhost:8080/#/addressBook',
        //inline: true
    }
};

