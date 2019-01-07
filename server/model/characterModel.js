const esi = require('eve-swagger');

const CachedModel = require('./CachedModel');

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
    const charData = esi.characters(id).info();
    const portraitData = esi.characters(id).portrait();
    return Promise.all([charData, portraitData]).then(([d1, d2]) => ({ ...d1, ...d2 }));
  }
}

module.exports = CharacterModel;
