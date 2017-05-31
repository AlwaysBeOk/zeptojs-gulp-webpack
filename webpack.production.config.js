const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = require('./config');
const MODULE_NAME = config.MODULE_NAME;

module.exports = {

  output: {
    /* global __dirname */
    path: path.join(__dirname, config.BUILD_DIST),
    filename: `${MODULE_NAME}/[name]/scripts.[chunkhash:8].js`,
    chunkFilename: `${MODULE_NAME}/chunks/[id].[chunkhash:8].js`,
    publicPath: '//h5.tianhongjijin.com.cn/mail/app/'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      { test: /zepto(\.min)?\.js$/, loader: 'exports-loader?window.$!script-loader' },
      {
        test: /\.css$/, loader: ExtractTextPlugin.extract({
          notExtractLoader: "style-loader",
          loader: ["css-loader?minimize", "postcss-loader"]
        })
      },
      { test: /\.(png)|(jpg)|(gif)$/, loader: `url-loader?limit=20000&name=${MODULE_NAME}/images/[name].[hash:8].[ext]&publicPath=/mail/app/` },
      { test: /\.tpl\.html$/, loader: "raw-loader" }
    ]
  },

  resolve: {
    alias: {
      "zepto": "zepto/dist/zepto.min.js",
      "domainConfig": path.join(__dirname, "./domain.config.production.js")
    }
  },

  plugins: [
    new ExtractTextPlugin({
      filename: `${MODULE_NAME}/[name]/[name].[contenthash:8].css`,
      allChunks: true
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: `${MODULE_NAME}/[name]/commons.[chunkhash:8].js`
    }),
    new webpack.optimize.UglifyJsPlugin()
  ]
};
