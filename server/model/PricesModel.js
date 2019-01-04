const esiRequest = require('../src/EsiRequest');
const logging = require('../src/Logging');

const cache = {};
let cacheExpires = 0;
const TTL_DAYS = 1;

function reloadCache() {
  // cache expired
  logging.log('Price cache expired');
  esiRequest
    .default(esiRequest.kinds.Prices)
    .then((data) => {
      data.body.forEach((price) => {
        cache[price.type_id] = price.adjusted_price;
      });
      cacheExpires = new Date();
      cacheExpires.setDate(cacheExpires.getDate() + TTL_DAYS);
      logging.log('Price cache loaded');
    })
    .catch((err) => {
      logging.error(`Price Cache ERROR ${err.message}`);
    });
}

function getPrice(id) {
  let res = 0;
  if (id in cache) {
    res = cache[id];
  }
  if (Date.now() > cacheExpires) {
    reloadCache();
  }
  return res;
}

// reloadCache();

module.exports = getPrice;
