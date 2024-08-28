const webpack = require('webpack');
const commonConfig = require('./webpack.common.js');
const helpers = require('./helpers');

const WebpackMerge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = WebpackMerge(commonConfig, {
  devtool: 'eval-source-map',

  output: {
    path: helpers.root('dist'),
    publicPath: './',
    filename: '[name].js',
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new ExtractTextPlugin('[name].css'),
  ],

  devServer: {
    historyApiFallback: true,
    stats: 'minimal',
  },
});
