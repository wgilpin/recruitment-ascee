const whitelist = [
  'http://localhost:3003',
  'http://localhost:3001',
];

function cb(origin, callback) {
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
