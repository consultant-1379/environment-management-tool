const webpack = require('webpack');
const WebpackMerge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const helpers = require('./helpers');

const commonConfig = require('./webpack.common.js');

module.exports = WebpackMerge(commonConfig, {
  devtool: 'eval-source-map',

  output: {
    path: helpers.root('dist'),
    publicPath: './',
    filename: '[name].js',
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('sandbox'),
    }),
    new ExtractTextPlugin('[name].css'),
  ],

  devServer: {
    historyApiFallback: true,
    stats: 'minimal',
  },
});
