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
  if (env) {
    return config[env] || config.default;
  }
  // no env supplied - might be on client
  if (process.env.DEV_ENV === 1) {
    return config.default;
  }
  return config.production;
};
