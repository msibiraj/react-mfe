/**
 * shell-app/webpack.config.js
 *
 * The Shell (Host) app — owns routing, layout, and shared context providers.
 * Pulls in remote MFEs at runtime via Module Federation.
 */

const HtmlWebpackPlugin       = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path                    = require('path');

module.exports = {
  entry: './src/index.jsx',
  mode:  'development',

  output: {
    publicPath: 'auto',            // lets Webpack resolve chunk URLs automatically
    path: path.resolve(__dirname, 'dist'),
  },

  resolve: { extensions: ['.jsx', '.js'] },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        loader: 'babel-loader',
        options: { presets: [['@babel/preset-react', { runtime: 'automatic' }]] },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',

      /**
       * Remote MFEs — each team deploys their remoteEntry.js independently.
       * Format: '<alias>@<url>/remoteEntry.js'
       * Change the URLs to point at each team's CDN/deployment.
       */
      remotes: {
        products: 'products@http://localhost:3001/remoteEntry.js',
        cart:     'cart@http://localhost:3002/remoteEntry.js',
        reco:     'reco@http://localhost:3003/remoteEntry.js',
      },

      /**
       * Shared singletons — only ONE copy of React runs across all MFEs.
       * Without this each MFE bundles its own React → hooks break.
       */
      shared: {
        react:        { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom':  { singleton: true, requiredVersion: '^18.0.0' },
        '@company/auth': { singleton: true },
        '@company/cart': { singleton: true },
        '@company/event-bus': { singleton: true },
      },
    }),

    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],

  devServer: { port: 3000, historyApiFallback: true },
};
