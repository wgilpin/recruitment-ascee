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
  if (window.location.origin.indexOf('localhost') > -1) {
    return config.default;
  }
  return config.production;
};
