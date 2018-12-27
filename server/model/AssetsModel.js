const EsiRequest = require('../src/EsiRequest');
const TypeModel = require('../model/TypesModel');
const LocationModel = require('../model/LocationModel');
const SystemModel = require('../model/SystemModel');
const logging = require('../src/Logging');
const User = require('../model/UserModel');


class AssetsModel {
  constructor() {
    this.token = null;
    this.assetTree = {};
    this.assets = {};
    this.typeIds = {};
    this.locationIds = {};
    this.stationList = {};
    this.containerList = {};
    this.assetTree = {};
  }

  getTypeName(id) {
    try {
      const typeRecord = new TypeModel();
      return typeRecord
        .get(id)
        .then((data) => {
          this.typeIds[id] = data.name;
        })
        .catch((err) => {
          logging.error(`typeIdToName error ${err.message}`);
        });
    } catch (err) {
      logging.error(`typeIdToName outer error ${err.message}`);
      return null;
    }
  }

  getLocationInfo(id) {
    try {
      const locationRecord = new LocationModel(this.token);
      return locationRecord
        .get(id)
        .then((data) => {
          try {
            if (data) {
              this.locationIds[id] = { name: data.name };
              if (data.system_id) {
                const system = new SystemModel();
                return system.get(data.system_id).then((sysData) => {
                  this.locationIds[id].system_name = sysData.name;
                  return true;
                });
              }
            }
          } catch (err) {
            logging.error(`locationIdToName inner error ${id} ${err.message}`);
          }
          return Promise.resolve(true);
        })
        .catch((err) => {
          logging.error(`getLocationInfo error ${id} ${err.message}`);
        });
    } catch (err) {
      logging.error(`getLocationInfo outer error ${err.message}`);
      return null;
    }
  }


  async get(userId) {
    this.id = userId;
    this.user = new User();
    await this.user.get(userId);
    this.token = this.user.values.accessToken;

    // read the list of assets
    // note ESI needs to point to /latest/ not /v1/
    // EsiRequest.default(EsiRequest.kinds.Assets, userId, tok, 1).then((response) => {
    //   logging.log('ok');
    // });

    return EsiRequest.default(EsiRequest.kinds.Assets, userId, this.token, 1).then((response) => {
      try {
        // const assetList = response.body.sort((a, b) => a.location_id - b.location_id);
        const assetList = response.body;
        // pass 1 - get list of ids
        assetList.forEach((asset) => {
          this.typeIds[asset.type_id] = '';
          this.locationIds[asset.location_id] = '';
          this.assets[asset.item_id] = asset;
        });

        // build promises
        const typePromises = Object.keys(this.typeIds).map(id => this.getTypeName(id));
        const locationPromises = Object.keys(this.locationIds)
          .map(id => this.getLocationInfo(id));
        // resolve all the promises
        return Promise.all(typePromises.concat(locationPromises))
          .then(() => {
            // pass 2 add the type and location names to each asset
            const assets = {};
            assetList.forEach((asset) => {
              const namedAsset = {
                ...asset,
                type: this.typeIds[asset.type_id],
                location: this.locationIds[asset.location_id],
                items: {},
                todo: true,
              };
              const assetSystem = (namedAsset.location || {}).system_name;
              assets[namedAsset.item_id] = namedAsset;
              if (assetSystem && !(asset.location_id in assets)) {
                assets[namedAsset.location_id] = { items: {}, name: assetSystem, todo: true };
              }
            });
            // pass 3 build the tree
            // assetTree is an empty dict to hold all top level assets puls children (items)
            let changes = true;
            while (changes) {
              changes = false;
              /* eslint-disable no-loop-func */ // why?????
              Object.keys(assets).forEach((key) => {
                const asset = assets[key];
                if (asset.todo && (asset.location_id in assets)) {
                  delete asset.todo;
                  assets[asset.location_id].items[asset.item_id] = asset;
                  changes = true;
                }
              });
            }
            const res = {};
            Object.keys(assets).forEach((key) => {
              if (assets[key].todo) {
                delete assets[key].todo;
                res[key] = assets[key];
              }
            });
            // assets.orphan = assets.filter(item => !!item.todo);
            return res;
          });
      } catch (err) {
        logging.error(`AssetModel get ${err.message}`);
        return false;
      }
    });

    // add to the tree
  }
}

module.exports = AssetsModel;
