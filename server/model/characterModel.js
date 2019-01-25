const Esi = require('../src/EsiRequest');

const CachedModel = require('./CachedModel');
const Store = require('./Store');

class CharacterModel extends CachedModel {
  // cache of characters from ESI
  constructor() {
    super(CharacterModel.getEsi);
    this.kind = 'Character';
    this.addField('refreshToken', CachedModel.Types.String, false);
    this.addField('expires', CachedModel.Types.Number, false);
    this.addField('main', CachedModel.Types.Any, false);
    this.addField('scopeToken', CachedModel.Types.String, false);
    this.addField('isAdmin', CachedModel.Types.Boolean, false, false);
    this.addField('isRecruiter', CachedModel.Types.Boolean, false, false);
    this.addField('isSnrRecruiter', CachedModel.Types.Boolean, false, false);

    // from Info()
    this.addField('ancestry_id', CachedModel.Types.Number, false);
    this.addField('birthday', CachedModel.Types.String, false);
    this.addField('bloodline_id', CachedModel.Types.Number, false);
    this.addField('corporation_id', CachedModel.Types.Number, false);
    this.addField('corporation', CachedModel.Types.Number, false);
    this.addField('description', CachedModel.Types.String, false);
    this.addField('gender', CachedModel.Types.String, false);
    this.addField('name', CachedModel.Types.String);
    this.addField('race_id', CachedModel.Types.Number, false);

    // from Portrait()
    this.addField('px128x128', CachedModel.Types.String, false);
    this.addField('px256x256', CachedModel.Types.String, false);
    this.addField('px512x512', CachedModel.Types.String, false);
    this.addField('px64x64', CachedModel.Types.String, false);
    this.addField('cachedOn', CachedModel.Types.Any, false);
  }

  static getEsi(id) {
    return Esi.get(Esi.kinds.Character, id)
      .then(charInfo => {
        const res = { body: { ...charInfo.body } };
        res.px64x64 = `https://image.eveonline.com/Character/${id}_64.jpg`;
        return res;
      })
      .catch(err => {
        console.log(`getEsi err ${id} ${err}`);
      });
  }

  static async getAlts(main) {
    const query = Store.datastore
      .createQuery('Character')
      .filter('main', '=', parseInt(main, 10));
    const alts = await Store.datastore.runQuery(query);
    return alts[0].reduce((acc, obj) => ({
      ...acc,
      [obj[Store.datastore.KEY].id]: obj,
    }));
  }

  static async getAll() {
    // return all characters that have roles or are a main
    const query = Store.datastore.createQuery('Character');
    const alts = await Store.datastore.runQuery(query);
    const users = {};
    alts[0].forEach((alt) => {
      const { id } = alt[Store.datastore.KEY];
      if (
        id === alt.main
        || alt.isAdmin
        || alt.isRecruiter
        || alt.isSnrRecruiter
      ) {
        users[id] = { ...alt, id };
      }
    });
    return users;
  }
}

module.exports = CharacterModel;
