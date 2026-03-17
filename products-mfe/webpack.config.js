/**
 * products-mfe/webpack.config.js
 *
 * Team Catalog — owns ProductsMFE and HeaderMFE.
 * Exposes them as remote modules consumed by the Shell.
 */

const HtmlWebpackPlugin       = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path                    = require('path');

module.exports = {
  entry: './src/index.jsx',
  mode:  'development',

  output: {
    publicPath: 'http://localhost:3001/',
    path: path.resolve(__dirname, 'dist'),
  },

  resolve: { extensions: ['.jsx', '.js'] },

  module: {
    rules: [{
      test: /\.[jt]sx?$/,
      loader: 'babel-loader',
      options: { presets: [['@babel/preset-react', { runtime: 'automatic' }]] },
      exclude: /node_modules/,
    }],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: 'products',
      filename: 'remoteEntry.js',         // Shell fetches this file

      exposes: {
        './ProductsMFE': './src/ProductsMFE',
        './HeaderMFE':   './src/HeaderMFE',
      },

      shared: {
        react:               { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom':         { singleton: true, requiredVersion: '^18.0.0' },
        '@company/auth':     { singleton: true },
        '@company/cart':     { singleton: true },
        '@company/event-bus':{ singleton: true },
      },
    }),

    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],

  devServer: { port: 3001, headers: { 'Access-Control-Allow-Origin': '*' } },
};
