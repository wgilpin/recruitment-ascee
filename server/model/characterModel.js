const esi = require('eve-swagger');

const CachedModel = require('./CachedModel');

class CharacterModel extends CachedModel {
  // cache of characters from ESI
  constructor() {
    super(CharacterModel.getEsi);
    this.kind = 'Character';
    this.addField('accessToken', CachedModel.Types.String, false);
    this.addField('refreshToken', CachedModel.Types.String, false);
    this.addField('expires', CachedModel.Types.Number, false);
    this.addField('main', CachedModel.Types.String, false);

    // from Info()
    this.addField('ancestry_id', CachedModel.Types.Number, false);
    this.addField('birthday', CachedModel.Types.String, false);
    this.addField('bloodline_id', CachedModel.Types.Number, false);
    this.addField('corporation_id', CachedModel.Types.Number);
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

  static async getEsi(id) {
    const charData = await CharacterModel.getInfo(id);
    const portraitData = await CharacterModel.getPortrait(id);
    return { ...charData, ...portraitData };
  }

  static getInfo(userId) {
    const char = esi.characters(userId);
    return char.info();
  }

  static getPortrait(userId) {
    const char = esi.characters(userId);
    return char.portrait();
  }
}

module.exports = CharacterModel;
