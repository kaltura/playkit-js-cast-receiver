'use strict';

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const packageData = require('./package.json');

const plugins = [
  new webpack.DefinePlugin({
    __VERSION__: JSON.stringify(packageData.version),
    __NAME__: JSON.stringify(packageData.name)
  })
];

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  if (!isProd) {
    plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: ' ',
            to: '.'
          }
        ]
      })
    );
  }

  return {
    context: __dirname + '/src',
    entry: {
      'playkit-cast-receiver': 'index.js'
    },
    output: {
      path: __dirname + '/dist',
      filename: '[name].js',
      library: ['KalturaPlayer', 'cast', 'receiver'],
      libraryTarget: 'umd',
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
};
