const NodeCache = require('node-cache');
const Esi = require('../src/EsiRequest');
const logging = require('../src/Logging');
const Store = require('./Store');


const cache = new NodeCache({ stdTTL: 3600 });


class NameCache {
  static datastoreKind() { return 'NameCache'; }

  static getKinds() {
    return Esi.kinds;
  }

  static async getEsi(id, type) {
    // returns promise
    try {
      const esiData = await Esi.get(Esi.kinds[type], id);
      return esiData.body || {};
    } catch (err) {
      logging.error(`Types ESI error ${err}`);
      return null;
    }
  }

  static dbRead(id) {
    /*
     * get an object from the db
     *
     * @param {number} id - datastore key id
     * @returns { type, name } | null
     */
    try {
      if (id === undefined) {
        throw new Error('NameCache get undefined id');
      }
      const key = Store.datastore.key({ path: [NameCache.datastoreKind(), parseInt(id, 10)] });
      return Store.datastore.get(key).then((dbEntities) => {
        const [dbEntity] = dbEntities;
        return dbEntity;
      });
    } catch (err) {
      logging.error(`Model get error ${err.message}`);
      return false;
    }
  }

  static createFromEsi(id, type) {
    return NameCache.getEsi(id, type).then((data) => {
      try {
        // truncate long descriptions
        const values = { type, ...data, id, description: data.description.substring(0, 200) };
        const key = Store.datastore.key({ path: [NameCache.datastoreKind(), parseInt(id, 10)] });
        return Store.datastore.save(
          {
            key,
            data: values,
          },
        ).then(() => {
          cache.set(id, values);
          return values;
        });
      } catch (exc) {
        logging.log(`DB entity not found ${id} ${exc.message}`);
        return null;
      }
    });
  }

  static async getFromDb(id, type) {
    try {
      return NameCache.dbRead(id)
        .then((data) => {
          if (data) {
            // found in db - add to memcache
            cache.set(id, data);
            return data;
          }
          // not in db
          logging.log(`NameCache: not found in ESI entity ${id}`);
          return NameCache.createFromEsi(id, type);
        })
        .catch((err) => {
          logging.error(`getFromDb 2 ${id} promise ${err}`);
          cache.set(id, {});
          return null;
        });
    } catch (err) {
      logging.error(`getFromDb 3 ${id} outer ${err}`);
      return {};
    }
  }

  static async get(id, type) {
    // if entity is in memcache, load & return.
    try {
      const data = cache.get(id);
      if (data === undefined || data.type === undefined) {
        return NameCache.getFromDb(id, type);
      }
      // found in cache
      return Promise.resolve(data);
    } catch (err) {
      // not in cache
      return NameCache.getFromDb(id, type)
        .then((data) => {
          if (!data) {
            // not found in db or ESI - don't esi again
            cache.set(id, { type });
          }
          return data || {};
        });
    }
  }
}

module.exports = NameCache;
