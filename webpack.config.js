const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const Visualizer = require('webpack-visualizer-plugin');

const config = require('./config');
const MODULE_NAME = config.MODULE_NAME;

module.exports = {

  output: {
    /* global __dirname */
    path: path.join(__dirname, config.BUILD_DIST),
    filename: `${MODULE_NAME}/[name]/scripts.js`,
    chunkFilename: `${MODULE_NAME}/chunks/[id].js`,
    publicPath: "/"
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
          loader: ["css-loader?sourceMap", "postcss-loader"]
        })
      },
      { test: /\.(png)|(jpg)|(gif)$/, loader: `url-loader?limit=20000&name=${MODULE_NAME}/images/[name].[ext]&publicPath=/` },
      { test: /\.tpl\.html$/, loader: "raw-loader" }
    ]
  },

  resolve: {
    alias: {
      "zepto": "zepto/dist/zepto.min.js",
      "domainConfig": path.join(__dirname, "./domain.config.dev.js")
    }
  },

  plugins: [
    new ExtractTextPlugin({
      filename: `${MODULE_NAME}/[name]/[name].css`,
      allChunks: true
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: `${MODULE_NAME}/[name]/commons.js`
    }),
    new Visualizer()
  ],

  devtool: 'source-map'
};
