
// var config = require('./config.js').get(process.env.NODE_ENV);

const config = {
  production: {
    client: {
      server: 'https://ascee-recruit.appspot.com',
    },
  },
  default: {
    client: {
      server: 'http://localhost:3000',
    },
  },
};

exports.get = function get(env) {
  return config[env] || config.default;
};
