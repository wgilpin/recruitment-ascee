/* eslint-disable camelcase */
const Esi = require('../src/EsiRequest');
const logging = require('../src/Logging');
const NameCache = require('./NameCache');
const TypesModel = require('./TypesModel');


class MarketModel {
  static async getHistory(userId, token) {
    try {
      const promises = [];
      const response = await Esi.get(Esi.kinds.MarketHistory, userId, token);
      const transactions = response.body;
      transactions.forEach((trans) => {
        promises.push(NameCache.get(trans.location_id, NameCache.getKinds().Structure));
        promises.push(NameCache.get(trans.region_id, NameCache.getKinds().Region));
        promises.push(TypesModel.get(trans.type_id));
      });
      const lookup = {};
      return Promise.all(promises).then((namesData) => {
        namesData.forEach((name) => {
          lookup[name.id] = name;
        });
        const result = [];
        transactions.forEach((trans) => {
          result.push({
            ...trans,
            type: (lookup[trans.type_id] || {}).name,
            location: (lookup[trans.location_id] || {}).name,
            region: (lookup[trans.region_id] || {}).name,
          });
        });
        return result;
      });
    } catch (err) {
      logging.error(`MarkeModel get ${err.message}`);
      return {};
    }
  }
}

module.exports = MarketModel;
