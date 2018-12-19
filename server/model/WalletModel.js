const esi = require('eve-swagger');
const Character = require('./CharacterModel');
const Names = require('./NamesModel');

class WalletModel {
  static async getWallet(userId, token) {
    let wallet;
    try {
      // https://esi.evetech.net/latest/#!/Wallet/get_characters_character_id_wallet_transactions
      wallet = await esi.characters(parseInt(userId, 10), token).wallet().transactions;
    } catch (err) {
      console.error(err.message);
      return {};
    }
    // load the names
    // eslint-disable-next-line no-restricted-syntax
    for (const trans of wallet) {
      const char = new Character();
      await char.get(trans.client_id);
      trans.from = char.name;
      await char.get(trans.location_id);
      trans.location = char.name;
    }
    return wallet;
  }
}

module.exports = WalletModel;
