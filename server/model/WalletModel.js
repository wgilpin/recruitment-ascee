const Character = require('./CharacterModel');
const Esi = require('../src/EsiRequest');

class WalletModel {
  static async getWallet(userId, token) {
    try {
      try {
        const response = await Esi.get(Esi.kinds.WalletJournal, userId, token);
        const wallet = response.body;
        for (let i = 0; i < wallet.length; i += 1) {
          const trans = wallet[i];
          const char = new Character();
          await char.get(trans.first_party_id);
          trans.first_party_id = { name: char.values.name };
          await char.get(trans.second_party_id);
          trans.second_party_id = { name: char.values.name };
        }
        return wallet;
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
