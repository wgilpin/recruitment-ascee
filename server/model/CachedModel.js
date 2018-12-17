/*
  Model class for items form ESI that need caching
*/
const Model = require('./Model');

class CachedModel extends Model {
  constructor(esiParser) {
    super();
    // TODO
    this.addField('EsiCacheValidUntil', Model.Types.Number, false, 0);
    if (!esiParser) {
      throw new Error('abstract class, implementor must supply an async esi parser returning a data object');
    }
    this.esiParser = esiParser;
  }

  cacheValid() {
    return (this.values.EsiCacheValidUntil || 0) > new Date();
  }

  async get(id) {
    // if entity is in db, load & return. If not, create via ESI
    if (!await super.get(id)) {
      try {
        const entityData = await this.esiParser(id);
        this.setFields(entityData);
      } catch (err) {
        console.log(`DB entity not found ${err}`);
      }
    }
  }
}

module.exports = CachedModel;
