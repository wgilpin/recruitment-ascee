/*
Model class for items form ESI that need caching
*/
const NodeCache = require('node-cache');
const Model = require('./Model');

const cache = new NodeCache({ stdTTL: 3600 });

class CachedModel extends Model {
  constructor(pEsiParser) {
    super();
    this.id = null;
    this.serverTtl = 3600 * 24;
    // TODO: set esicachetimeout
    this.addField('EsiCacheValidUntil', Model.Types.Number, false, 0);
    if (!pEsiParser) {
      throw new Error('abstract class, implementor must supply an esi parser resolving to a data object');
    }
    this.pEsiParser = pEsiParser;
  }

  cacheValid() {
    return (this.values.EsiCacheValidUntil || 0) > new Date();
  }

  pGetFromEsi() {
    this.pEsiParser(this.id).then((entityData) => {
      try {

        this.setFields(entityData);
        return this.save().then(() => this.values);
      } catch (exc) {
        console.log(`DB entity not found ${this.id} ${exc.message}`);
        return null;
      }
    });
  }

  pGetFromDb() {
    return super.get(this.id).then((success) => {
      try {
        if (success) {
          // found in db - add to memcache
          cache.set(this.id, this.values);
          return this.values;
        }
        // not in db
        console.log(`CachedModel: not found in ESI entity ${this.id}`);
        return this.pGetFromEsi();
      } catch (err) {
        return this.pGetFromEsi();
      }
    });
  }

  get(id) {
    this.id = id;
    // if entity is in memcache, load & return.
    try {
      const data = cache.get(id);
      if (!data || data.Type === null) {
        return this.pGetFromDb();
      }
      // found in cache
      this.values = data;
      return Promise.resolve(data);
    } catch (err) {
      // not in cache
      return this.pGetFromDb();
    }
  }
}

module.exports = CachedModel;
