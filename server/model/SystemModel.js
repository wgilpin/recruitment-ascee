const Esi = require('../src/EsiRequest');

const logging = require('../src/Logging');
const CachedModel = require('./CachedModel');

class SystemModel extends CachedModel {
  constructor() {
    super(SystemModel.getEsi);
    this.kind = 'System';
    this.addField('name', CachedModel.Types.String, false);
  }

  static getEsi(id) {
    /*
     * @returns Promise
     */
    try {
      return Esi.get(Esi.kinds.System, parseInt(id, 10))
        .then((data) => {
          logging.debug(`systemmodel getEsi ${id} = ${data}`);
          return data;
        })
        .catch((err) => {
          logging.debug(`systemmodel getEsi Error ${id} = ${err}`);
          return null;
        });
    } catch (err) {
      logging.debug(`System ESI error ${err}`);
      return null;
    }
  }
}

module.exports = SystemModel;
