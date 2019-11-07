// var config = require('./config.js').get(process.env.NODE_ENV);

const config = {
  production: {
    client: {
      server: process.env.REACT_APP_APP_URL,
    },
  },
  default: {
    client: {
      server: 'http://localhost:8080',
    },
  },
};

exports.get = function get(env) {
  if (window.location.origin.indexOf('localhost') > -1) {
    return config.default;
  }
  return config.production;
};
