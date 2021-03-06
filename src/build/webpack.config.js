/**************************************************************************
* This file is part of the WebIssues Server program
* Copyright (C) 2006 Michał Męciński
* Copyright (C) 2007-2017 WebIssues Team
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
**************************************************************************/

const path = require( 'path' );
const webpack = require( 'webpack' );
const VueLoaderPlugin = require( 'vue-loader/lib/plugin' );
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const AssetsPlugin = require( 'assets-webpack-plugin' );

const version = require( '../../package' ).version;

module.exports = function( { electron, production } = {} ) {
  if ( production )
    process.env.NODE_ENV = 'production';

  const styleLoader = production ? MiniCssExtractPlugin.loader : 'vue-style-loader';

  const cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: production
    }
  };

  const config = {
    mode: production ? 'production' : 'development',
    entry: electron ? {
      client: './src/client.js'
    } : {
      common: './src/common.js',
      application: './src/application.js'
    },
    output: {
      path: path.resolve( __dirname, electron ? '../../app/assets' : '../../assets' ),
      publicPath: production ? '../' : 'http://localhost:8080/',
      filename: production ? 'js/[name].min.js?[chunkhash]' : 'js/[name].js',
      library: electron ? undefined : 'WebIssues_[name]'
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.(png|jpg)$/,
          loader: 'file-loader',
          options: {
            name: 'images/[name].[ext]?[hash]'
          }
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[ext]?[hash]'
          }
        },
        {
          test: /\.css$/,
          use: [ styleLoader, cssLoader ]
        },
        {
          test: /\.less$/,
          use: [ styleLoader, cssLoader, 'less-loader' ]
        }
      ]
    },
    resolve: {
      extensions: [ '.js', '.vue', '.json' ],
      alias: {
        '@': path.resolve( __dirname, '..' )
      }
    },
    plugins: [
      new VueLoaderPlugin(),
      new webpack.EnvironmentPlugin( {
        TARGET: electron ? 'electron' : 'web'
      } )
    ],
    devServer: {
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      contentBase: false,
      noInfo: true,
      hot: true,
      overlay: true
    },
    performance: {
      hints: false
    },
    stats: {
      children: false,
      modules: false
    },
    devtool: production ? false : '#cheap-module-eval-source-map',
    target: electron ? 'electron-renderer' : 'web'
  };

  if ( production ) {
    config.plugins.push( new MiniCssExtractPlugin( {
      filename: 'css/[name].min.css?[contenthash]'
    } ) );
    config.plugins.push( new webpack.BannerPlugin( {
      banner: 'WebIssues v' + version + '\nCopyright (C) 2007-2017 WebIssues Team\nLicense: Affero GPL v3.0'
    } ) );
    if ( !electron ) {
      config.plugins.push( new AssetsPlugin( {
        filename: 'assets.json',
        path: config.output.path,
        fullPath: false
      } ) );
    }
  } else {
    config.plugins.push( new webpack.HotModuleReplacementPlugin() );
  }

  return config;
};
