const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const helpers = require('./helpers');

module.exports = {
  entry: {
    app: './src/main.ts',
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loaders: [
          {
            loader: 'awesome-typescript-loader',
            options: { configFileName: helpers.root('src', 'tsconfig.json') },
          }, 'angular2-template-loader',
        ],
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: 'html-loader',
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
        loader: 'file-loader?./assets/[name].[ext]',
      },
      {
        test: /\.css$/,
        exclude: helpers.root('src', 'app'),
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.css$/,
        include: helpers.root('src', 'app'),
        loader: 'raw-loader',
      },
      {
        test: /favicon.ico$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        },
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      favicon: 'src/assets/img/favicon.ico',
    }),
  ],
};
