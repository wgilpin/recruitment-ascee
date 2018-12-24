const Character = require('./CharacterModel');
const EsiRequest = require('../src/EsiRequest');

class WalletModel {
  static async getWallet(userId, token) {
    try {
      // https://esi.evetech.net/latest/#!/Wallet/get_characters_character_id_wallet_transactions
      // curl -i --compressed -X GET --header  'https://esi.evetech.net/latest/characters/93207621/wallet/?datasource=tranquility&token=lXJwp2lbZH4bmrexqOFnurkmkznjLhE4vDbcfpofFNvKYBn2ygGkS3eQyMHAn77EN129iwRqyr4KXvIWRMZXaQ2'
      // wallet = await esi.characters(parseInt(userId, 10), token);
      try {
        const response = await EsiRequest.default(EsiRequest.kinds.WalletJournal, userId, token);
        // const response = await request({
        //   method: 'GET',
        //   url: `https://esi.evetech.net/latest/characters/${userId}/wallet/journal?datasource=tranquility&token=${token}`,
        //   headers: {
        //     Accept: 'application/json',
        //     'Content-Type': 'application/json',
        //   },
        // });
        // load the names
        // eslint-disable-next-line no-restricted-syntax
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
