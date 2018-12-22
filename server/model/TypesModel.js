const esi = require('eve-swagger');

const CachedModel = require('./CachedModel');

// const getEsi = async (id) => {
//   const { Type, category } = esi.Types(id);
//   return { Types, category };
// };

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
      return esi.types(parseInt(id, 10)).info().then((data) => {
        console.log(`getEsi ${id} = ${data}`);
        return data;
      });
    } catch (err) {
      console.log(`Types ESI error ${err}`);
      return null;
    }
  }
}

module.exports = TypesModel;
