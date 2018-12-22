const esi = require('eve-swagger');
const TypeModel = require('../model/TypesModel');
const LocationModel = require('../model/LocationModel');


class AssetsModel {
  constructor() {
    this.assetTree = {};
    this.assets = {};
    this.typeIds = {};
    this.locationIds = {};
  }

  typeIdToName(id) {
    try {
      const typeRecord = new TypeModel();
      return typeRecord
        .get(id)
        .then((data) => {
          this.typeIds[id] = data.name;
        })
        .catch((err) => {
          console.log(`typeIdToName error ${err.message}`);
        });
    } catch (err) {
      console.log(`typeIdToName outer error ${err.message}`);
      return null;
    }
  }

  locationIdToName(id) {
    try {
      const locationRecord = new LocationModel();
      return locationRecord
        .get(id)
        .then((data) => {
          this.locationIds[id] = data.name;
          console.log(`locationIdToName data ${data}`)
        })
        .catch((err) => {
          console.log(`locationIdToName error ${id} ${err.message}`);
        });
    } catch (err) {
      console.log(`locationIdToName outer error ${err.message}`);
      return null;
    }
  }

  get(userId, tok) {
    this.id = userId;
    this.token = tok;
    // read the list of assets
    // note ESI needs to point to /latest/ not /v1/
    return esi.characters(userId, tok).assets().then((assetList) => {
      try {
        // pass 1 - get list of ids
        assetList.forEach((asset) => {
          this.typeIds[asset.type_id] = '';
          this.locationIds[asset.location_id] = '';
        });
        // pass 2, build promises
        const typePromises = Object.keys(this.typeIds).map(id => this.typeIdToName(id));
        const locationPromises = Object.keys(this.locationIds).map(id => this.locationIdToName(id));
        return Promise.all(typePromises.concat(locationPromises))
          .then(() => assetList.map((asset) => {
            console.log(`location: ${this.locationIds[asset.location_id]}`)
            return ({
              ...asset,
              type: this.typeIds[asset.type_id],
              location: this.locationIds[asset.location_id],
            });
          }));
      } catch (err) {
        console.log(`AssetModel get error ${err.message}`);
        return false;
      }
    });

    // add to the tree
  }
}

module.exports = AssetsModel;
