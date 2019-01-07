const EsiRequest = require('../src/EsiRequest');

const CachedModel = require('./CachedModel');
const Store = require('./Store');
const RecruitModel = require('./RecruitModel');


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

    // workflow
    this.addField('status', CachedModel.Types.Number, true, RecruitModel.statuses.unclaimed);

  }

  static getEsi(id) {
    const charData = EsiRequest.default(EsiRequest.kinds.Character, id);
    const portraitData = EsiRequest.default(EsiRequest.kinds.CharacterPortrait, id);
    return Promise
      .all([charData, portraitData])
      .then(([charInfo, charPics]) => ({ body: { ...charInfo.body, ...charPics.body } }));
  }

  static async getAlts(main) {
    const query = Store.datastore.createQuery('Character').filter('main', '=', main);
    const alts = await Store.datastore.runQuery(query);
    return alts[0];
  }
}

module.exports = CharacterModel;
