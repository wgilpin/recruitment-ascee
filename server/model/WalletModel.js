const NameCache = require('./NameCache');
const Esi = require('../src/EsiRequest');

class WalletModel {
  static async getWallet(userId, token) {
    const missing = {};
    try {
      try {
        const response = await Esi.get(Esi.kinds.WalletJournal, userId, token);
        const wallet = response.body;
        wallet.forEach((wi) => {
          missing[wi.first_party_id] = '';
          missing[wi.second_party_id] = '';
        });
        const promises = Object.keys(missing).map(id => NameCache.get(id, NameCache.getKinds().CharacterOrCorp));
        return Promise.all(promises).then((data) => {
          const lookup = {};
          data.forEach((it) => {
            lookup[it.id] = it;
          });
          for (let i = 0; i < wallet.length; i += 1) {
            const trans = wallet[i];
            const first = lookup[trans.first_party_id] || { name: 'Unknown', standing: -10 };
            const second = lookup[trans.second_party_id] || { name: 'Unknown', standing: -10 };
            trans.first_party_id = { ...first };
            trans.second_party_id = { ...second };
          }
          return wallet;
        })
      } catch (err) {
        if (err.statusCode === 503) {
          // downtime
          console.error(`fetch wallet ${err.statusCode}`);
          return { error: 503 };
        }
        console.error(`fetch wallet ${err.message}`);
        return {};
      }
    } catch (err) {
      console.error(err.message);
      return {};
    }
  }
}

module.exports = WalletModel;
