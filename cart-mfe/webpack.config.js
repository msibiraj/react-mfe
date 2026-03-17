/**
 * cart-mfe/webpack.config.js — Team Commerce
 */

const HtmlWebpackPlugin       = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path                    = require('path');

module.exports = {
  entry: './src/index.jsx',
  mode:  'development',

  output: {
    publicPath: 'http://localhost:3002/',
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
      name: 'cart',
      filename: 'remoteEntry.js',

      exposes: {
        './CartMFE': './src/CartMFE',
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

  devServer: { port: 3002, headers: { 'Access-Control-Allow-Origin': '*' } },
};
