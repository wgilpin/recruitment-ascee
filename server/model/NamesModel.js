const esi = require('eve-swagger');
const NodeCache = require('node-cache');

const CachedModel = require('./CachedModel');

// const getEsi = async (id) => {
//   const { name, category } = esi.names(id);
//   return { names, category };
// };

class NamesModel extends CachedModel {
  constructor() {
    super(NamesModel.getEsi);
    this.kind = 'Names';
    this.addField('name', CachedModel.Types.String, false);
  }

  static async getEsi(id) {
    // names requires and returns an array - we only have item
    try {
      const [res] = await esi.names([parseInt(id, 10)]);
      return res;
    } catch (err) {
      console.log(`Names ESI error ${err}`);
      return null;
    }
  }
}

class NamesCache {
  constructor() {
    // create a 24 hour cache
    this.cache = new NodeCache({ stdTTL: 3600 * 24 });
  }

  async get(itemId) {
    /*
     * get names
     *
     * @param {Array of int} userIdArray - list of ids to get
     * @returns dict mapping userId to { name: string, category: string }
     */
    try {
      const cached = this.cache.get(itemId);
      if (cached && cached.name) {
        return { name: cached.name, category: cached.category };
      }
      const name = new NamesModel();
      const item = await name.get(itemId);
      this.cache.set(itemId, item);
      return item;
    } catch (err) {
      console.error(`NamesCache ${err.message}`);
    }
    return null;
  }

  async getMulti(itemList) {
    /*
     * get names
     *
     * @param {Array of int} userIdArray - list of ids to get
     * @returns dict mapping userId to { name: string, category: string }
     */
    const notFound = [];
    const res = {};
    itemList.forEach((id) => {
      try {
        const itemId = parseInt(id, 10);
        const cached = this.cache.get(itemId);
        if (cached && cached.name) {
          res[itemId] = { itemId, name: cached.name, category: cached.category };
        }
        notFound.push(itemId);
      } catch (err) {
        console.error(`NamesCache ${err.message}`);
      }
    });
    const name = new NamesModel();
    const items = await name.get(notFound);
    items.forEach((id) => {
      try {
        const itemId = parseInt(id, 10);
        this.cache.set(itemId, item);
        res[itemId] = { itemId, name: cached.name, category: cached.category };
      } catch (err) {
        console.error(`NamesCache esi ${err.message}`);
      }
    });
  }
}

const instance = new NamesCache();

module.exports = instance;
