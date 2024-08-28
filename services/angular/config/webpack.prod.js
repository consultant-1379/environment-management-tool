const helpers = require('./helpers');
const commonConfig = require('./webpack.common.js');

const Webpack = require('webpack');
const WebpackMerge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BabiliPlugin = require('babel-minify-webpack-plugin');

module.exports = WebpackMerge(commonConfig, {
  output: {
    path: helpers.root('dist'),
    publicPath: './',
    filename: '[name].js',
  },

  plugins: [
    new Webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new ExtractTextPlugin('[name].css'),
  ],
});
