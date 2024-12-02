const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

module.exports = {
  resolve: {
    fallback: {
      process: require.resolve('process/browser'),
    },
  },
  plugins: [
    new Dotenv(),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
};