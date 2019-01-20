/* eslint-disable camelcase */
const Esi = require('../src/EsiRequest');
const logging = require('../src/Logging');
const NameCache = require('./NameCache');
const TypesModel = require('./TypesModel');


class MarketModel {
  static async getHistory(userId, token) {
    try {
      const toLookup = {};
      const marketHistory = await Esi.get(Esi.kinds.MarketHistory, userId, token);
      const transactions = marketHistory.body;
      transactions.forEach((trans) => {
        toLookup[trans.location_id] = 'loc';
        toLookup[trans.region_id] = 'region';
        toLookup[trans.type_id] = 'type';
      });
      const promises = [];
      Object.keys(toLookup).forEach((id) => {
        if (toLookup[id] === 'loc') {
          promises.push(NameCache.getLocation(id, token));
        } else if (toLookup[id] === 'region') {
          promises.push(NameCache.get(id, Esi.kinds.Region));
        } else {
          const typeInfo = new TypesModel();
          promises.push(typeInfo.get(id));
        }
      });
      const lookup = {};
      return Promise.all(promises).then((namesData) => {
        namesData.forEach((nameData) => {
          if (nameData) {
            lookup[nameData.id] = nameData;
          }
        });
        const result = [];
        transactions.forEach((trans) => {
          result.push({
            ...trans,
            price: trans.price * (trans.volume_total - trans.volume_remain) * (trans.is_buy_order ? -1 : 1),
            type: (lookup[trans.type_id] || { name: 'unknown' }).name,
            location: (lookup[trans.location_id] || { name: 'unknown' }).name,
            region: (lookup[trans.region_id] || { name: 'unknown' }).name,
          });
        });
        return result;
      });
    } catch (err) {
      logging.error(`MarkeModel get ${err.message}`);
      return null;
    }
  }
}

module.exports = MarketModel;
