const esi = require('eve-swagger');
const NodeCache = require('node-cache');

const CachedModel = require('./CachedModel');

const getEsi = async (id) => {
  const { name, category } = esi.names(id);
  return {names, category};
}

class NamesModel extends CachedModel {
  constructor(getEsi) {
    super(CharacterModel.getEsi);
    this.kind = 'Character';
    this.addField('category', CachedModel.Types.String, false);
    this.addField('name', CachedModel.Types.String, false);
  }
}

class NamesCache {
  constructor() {
    // create a 24 hour cache
    this.cache = new NodeCache({ stdTTL: 3600 * 24 });
  }

  async get(userIdArray) {
    /*
     * get names
     *
     * @param {Array of int} userIdArray - list of ids to get
     * @returns dict mapping userId to { name: string, category: string }
     */
    const res = {}
    userIdArray.forEach((itemId) => {
      try {
        const cached = this.cache.get(itemId);
        if (cached) {
          res[itemId] = { name: cached.name, category: cached.category };
        } else {
          const item = await NamesModel.get(itemId);
          this.cache.set(itemId, item);
          res[itemId] = item;
        }
      } catch (err) {
        console.error(`NamesCache ${err.message}`);
        return null;
      }
    });
    return res;
  }
}

const instance = new NamesCache();

module.exports = instance;
