const Esi = require('../src/EsiRequest');
const CachedModel = require('./CachedModel');

class TypesModel extends CachedModel {
  constructor() {
    super(TypesModel.getEsi);
    this.kind = 'Types';
    this.addField('name', CachedModel.Types.String, false);
  }

  static getEsi(id) {
    // Types requires and returns an array - we only have item
    // returns promise
    try {
      return Esi
        .get(Esi.kinds.Types, id);
    } catch (err) {
      console.log(`Types ESI error ${err}`);
      return null;
    }
  }
}

module.exports = TypesModel;
