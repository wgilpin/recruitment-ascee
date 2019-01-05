
// var config = require('./config.js').get(process.env.NODE_ENV);

const config = {
  production: {
    client: {
      server: 'https://ascee-recruit.appspot.com',
      CLIENT_ID: '591fc1209db44106a69d9ef71a1ece97',
      SECRET_KEY: '3ew6jXuf2p75QYRJlH6cJB2gGqnAP8tZu7L9uyWc',
      CALLBACK_URL: 'https://ascee-recruit.appspot.com/oauth-callback',
    },
  },
  default: {
    client: {
      server: 'http://localhost:3000',
      CLIENT_ID: '37de4bba039744c0a4d59cc15c9748c2',
      SECRET_KEY: 'O0q1KdspI0QRNlpX3nlSgXIGn0WJ9DOxxqj1bHrv',
      CALLBACK_URL: 'https://ascee-recruit.appspot.com/oauth-callback',
    },
  },
};

exports.get = function get(env) {
  return config[env] || config.default;
};
