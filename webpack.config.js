'use strict';

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const PROD = process.env.NODE_ENV === 'production';
const packageData = require('./package.json');

const plugins = [
  new webpack.DefinePlugin({
    __VERSION__: JSON.stringify(packageData.version),
    __NAME__: JSON.stringify(packageData.name)
  })
];

if (PROD) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({sourceMap: true}));
} else {
  plugins.push(
    new CopyWebpackPlugin([
      {
        from: '',
        to: '.'
      }
    ])
  );
}

module.exports = {
  context: __dirname + '/src',
  entry: {
    'playkit-cast-receiver': 'index.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    library: ['KalturaPlayer', 'cast', 'receiver'],
    libraryTarget: 'umd',
    libraryExport: 'default',
    umdNamedDefine: true,
    devtoolModuleFilenameTemplate: './cast/receiver/[resource-path]'
  },
  devtool: 'source-map',
  plugins: plugins,
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader'
          }
        ],
        exclude: [/node_modules/]
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        enforce: 'pre',
        use: [
          {
            loader: 'eslint-loader',
            options: {
              rules: {
                semi: 0
              }
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          }
        ]
      }
    ]
  },
  devServer: {
    contentBase: __dirname + '/src'
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  externals: {
    'kaltura-player-js': {
      commonjs: 'kaltura-player-js',
      commonjs2: 'kaltura-player-js',
      amd: 'kaltura-player-js',
      root: ['KalturaPlayer']
    }
  }
};
