const EsiRequest = require('../src/EsiRequest');

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

    // from Info()
    this.addField('ancestry_id', CachedModel.Types.Number, false);
    this.addField('birthday', CachedModel.Types.String, false);
    this.addField('bloodline_id', CachedModel.Types.Number, false);
    this.addField('corporation_id', CachedModel.Types.Number, false);
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
    const charData = EsiRequest.default(EsiRequest.kinds.Character, id);
    const portraitData = EsiRequest.default(EsiRequest.kinds.CharacterPortrait, id);
    return Promise
      .all([charData, portraitData])
      .then(([charInfo, charPics]) => ({ body: { ...charInfo.body, ...charPics.body } }));
  }

  static async getAlts(main) {
    const query = Store.datastore.createQuery('Character').filter('main', '=', parseInt(main, 10));
    const alts = await Store.datastore.runQuery(query);
    const altsDict = {};
    alts[0].forEach((alt) => {
      altsDict[alt[Store.datastore.KEY].id] = alt;
    });
    return altsDict;
  }
}

module.exports = CharacterModel;
