const esi = require('eve-swagger');
const CachedModel = require('./CachedModel');
const esiRequest = require('../src/EsiRequest');
const logging = require('../src/Logging');

class LocationModel extends CachedModel {
  constructor(token) {
    super(LocationModel.getEsi);
    this.kind = 'Location';
    this.token = token;
    this.addField('name', CachedModel.Types.String, false);
    this.addField('system_id', CachedModel.Types.Number, false);
  }

  static getEsi(id) {
    // Location requires and returns an array - we only have item
    // returns promise
    try {
      console.log(`GetFromEsi ${id}`);
      const nId = parseInt(id, 10);
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
        return esi.stations(nId).info()
          .then((data) => {
            if (nId === 60003760) {
              console.log(`getFromEsi return ${locationType}`, data);
            }
            return { body: data };
          });
      } else if (id >= 40000000 && id <= 50000000) {
        locationType = 'Planet ';
      } else {
        locationType = 'Structure';
        return esiRequest
          .default(esiRequest.kinds.Structure, nId, this.token)
          .then((data) => {
            console.log(`getFromEsi return2 ${locationType}`, data);
            return ({
              body: { ...data.body, system_id: data.body.solar_system_id, kind: locationType },
            });
          });
      }
      if (dataFn) {
        return dataFn(parseInt(id, 10)).then((data) => {
          logging.debug(`getEsi location ${id} = ${data}`);
          return data;
        });
      }
      return Promise.resolve(locationType);
    } catch (err) {
      logging.log(`Location ESI error ${err}`);
      return null;
    }
  }
}

module.exports = LocationModel;