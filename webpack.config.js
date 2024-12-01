const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      process: require.resolve('process/browser')
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        API_KEY: JSON.stringify(process.env.API_KEY),
        AUTH_DOMAIN: JSON.stringify(process.env.AUTH_DOMAIN),
        DATABASE_URL: JSON.stringify(process.env.DATABASE_URL),
        PROJECT_ID: JSON.stringify(process.env.PROJECT_ID),
        STORAGE_BUCKET: JSON.stringify(process.env.STORAGE_BUCKET),
        MSG_SENDER_ID: JSON.stringify(process.env.MSG_SENDER_ID),
        APP_ID: JSON.stringify(process.env.APP_ID),
        MEASUREMENT_ID: JSON.stringify(process.env.MEASUREMENT_ID),
        MOVIE_URL: JSON.stringify(process.env.MOVIE_URL),
        SHOW_URL: JSON.stringify(process.env.SHOW_URL),
        FEED_URL: JSON.stringify(process.env.FEED_URL),
        USER_URL: JSON.stringify(process.env.USER_URL),
      },
    }),
  ],
};
