/*
Model class for items form ESI that need caching
*/
const NodeCache = require('node-cache');
const Model = require('./Model');
const logging = require('../src/Logging');

const cache = new NodeCache({ stdTTL: 3600 });

class CachedModel extends Model {
  constructor(esiParser) {
    super();
    this.id = null;
    this.serverTtl = 3600 * 24;
    // TODO: set esicachetimeout
    this.addField('EsiCacheValidUntil', Model.Types.Number, false, 0);
    if (!esiParser) {
      throw new Error('abstract class, implementor must supply an esi parser resolving to a data object');
    }
    this.pEsiParser = esiParser;
  }

  cacheValid() {
    return (this.values.EsiCacheValidUntil || 0) > new Date();
  }

  createFromEsi() {
    return this.pEsiParser(this.id).then((entityData) => {
      try {
        // allow a null save as it avoids an ESI error
        this.setFields((entityData || {}).body);
        return this.save().then(() => this.values);
      } catch (exc) {
        logging.log(`DB entity not found ${this.id} ${exc.message}`);
        return null;
      }
    });
  }

  getFromDb() {
    try {
      return super.get(this.id)
        .then((success) => {
          try {
            if (success) {
            // found in db - add to memcache
              cache.set(this.id, this.values);
              return this.values;
            }
            // not in db
            logging.log(`CachedModel: not found in ESI entity ${this.id}`);
            return this.createFromEsi()
              .then((data) => {
                return data;
              });
          } catch (err) {
            logging.error(`getFromDb ${this.id} ${err} `);
            return this.createFromEsi();
          }
        })
        .catch((err) => {
          logging.error(`getFromDb ${this.id} promise ${err}`);
          cache.set(this.id, {});
          return null;
        });
    } catch (err) {
      logging.error(`getFromDb ${this.id} outer ${err}`);
      return {};
    }
  }

  get(id) {
    this.id = id;
    // if entity is in memcache, load & return.
    try {
      const data = cache.get(id);
      if (!data || data.Type === null) {
        return this.getFromDb();
      }
      // found in cache
      this.values = data;
      return Promise.resolve(data);
    } catch (err) {
      // not in cache
      return this.getFromDb()
        .then((data) => {
          if (!data) {
            this.cache.set(id, {});
          }
          return data;
        });
    }
  }
}

module.exports = CachedModel;
