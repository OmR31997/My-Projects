// src/environments/environment.prod.ts

export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: process.env['API_KEY'],  // Use bracket notation
    authDomain: process.env['AUTH_DOMAIN'],
    databaseURL: process.env['DATABASE_URL'],
    projectId: process.env['PROJECT_ID'],
    storageBucket: process.env['STORAGE_BUCKET'],
    messagingSenderId: process.env['MSG_SENDER_ID'],
    appId: process.env['APP_ID'],
    measurementId: process.env['MEASUREMENT_ID'],
  },
  entertaiment: {
    movieApiUrl: process.env['MOVIE_URL'],  // Use bracket notation
    showApiUrl: process.env['SHOW_URL'],
    feedBApiUrl: process.env['FEED_URL'],
    userApiUrl: process.env['USER_URL'],
  },
};
