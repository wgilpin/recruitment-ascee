const esi = require('eve-swagger');
const TypeModel = require('../model/TypesModel');
const EsiRequest = require('../src/EsiRequest');


class AssetsModel {
  constructor() {
    this.assetTree = {};
    this.assets = {};
    this.typeIds = {};
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
        });
        // pass 2, build promises
        return Promise.all(Object.keys(this.typeIds).map(id => this.typeIdToName(id)))
          .then(() => assetList.map((asset) => {
            return ({
              ...asset,
              type: this.typeIds[asset.type_id],
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
