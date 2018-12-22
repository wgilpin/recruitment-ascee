const esi = require('eve-swagger');

const CachedModel = require('./CachedModel');

class LocationModel extends CachedModel {
  constructor() {
    super(LocationModel.getEsi);
    this.kind = 'Location';
    this.addField('name', CachedModel.Location.String, false);
  }

  static getEsi(id) {
    // Location requires and returns an array - we only have item
    // returns promise
    try {
      let locationType = 'unknown';
      let dataFn;
      if (id === 2004) {
        locationType = 'Asset Safety';
      } else if (id >= 30000000 && id < 32000000) {
        locationType = 'System';
        dataFn = esi.solarSystems.names;
      } else if (id >= 32000000 && id <= 33000000) {
        locationType = 'Abyssal System';
        dataFn = esi.solarSystems.names;
      } else if (id >= 60000000 && id <= 64000000) {
        locationType = 'Station ';
        dataFn = esi.stations.names;
      } else if (id >= 40000000 && id <= 50000000) {
        locationType = 'Planet ';
      }
      console.log(`location ${id} type ${locationType}`);
      if (dataFn) {
        return dataFn(parseInt(id, 10)).then((data) => {
          console.log(`getEsi location ${id} = ${data}`);
          return data;
        });
      }
      return Promise(locationType);
    } catch (err) {
      console.log(`Location ESI error ${err}`);
      return null;
    }
  }
}

module.exports = LocationModel;
