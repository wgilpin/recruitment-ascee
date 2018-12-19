const whitelist = ['http://localhost:3003'];

function cb(origin, callback) {
  console.log('cors', origin);
  if (whitelist.indexOf(origin) !== -1 || !origin) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}


const corsOptions = {
  origin: cb,
  optionsSuccessStatus: 204,
};

module.exports = corsOptions;
