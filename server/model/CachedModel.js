/*
Model class for items form ESI that need caching
*/
const NodeCache = require('node-cache');
const Model = require('./Model');

const cache = new NodeCache({ stdTTL: 3600 });

class CachedModel extends Model {
  constructor(esiParser) {
    super();
    this.id = null;
    this.serverTtl = 3600 * 24;
    // TODO: set esicachetimeout
    this.addField('EsiCacheValidUntil', Model.Types.Number, false, 0);
    if (!esiParser) {
      throw new Error('abstract class, implementor must supply an async esi parser returning a data object');
    }
    this.esiParser = esiParser;
  }

  cacheValid() {
    return (this.values.EsiCacheValidUntil || 0) > new Date();
  }

  async getFromEsi() {
    try {
      const entityData = await this.esiParser(this.id);
      this.setFields(entityData);
      this.save();
      return this.values;
    } catch (exc) {
      console.log(`DB entity not found ${exc}`);
      return null;
    }
  }

  async getFromDb() {
    if (await super.get(this.id)) {
      // found in db - add to memcache
      cache.set(this.id, this.values);
      return this.values;
    }
    // not in db
    return this.getFromEsi();
  }

  async get(id) {
    this.id = id;
    // if entity is in memcache, load & return.
    try {
      const data = await cache.get(id);
      if (!data) {
        return this.getFromDb();
      }
      // found in cache
      this.values = data;
      return data;
    } catch (err) {
      // not in cache
      return this.getFromDb();
    }
  }
}

module.exports = CachedModel;
