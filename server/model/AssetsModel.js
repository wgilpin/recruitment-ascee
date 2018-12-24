const EsiRequest = require('../src/EsiRequest');
const TypeModel = require('../model/TypesModel');
const LocationModel = require('../model/LocationModel');
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
          logging.error(`typeIdToName error ${err.message}`);
        });
    } catch (err) {
      logging.error(`typeIdToName outer error ${err.message}`);
      return null;
    }
  }

  locationIdToName(id) {
    try {
      const locationRecord = new LocationModel(this.token);
      return locationRecord
        .get(id)
        .then((data) => {
          this.locationIds[id] = data.name;
        })
        .catch((err) => {
          logging.error(`locationIdToName error ${id} ${err.message}`);
        });
    } catch (err) {
      logging.error(`locationIdToName outer error ${err.message}`);
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
      const assetList = response.body;
      try {
        // return assetList;
        // pass 1 - get list of ids
        assetList.forEach((asset) => {
          this.typeIds[asset.type_id] = '';
          this.locationIds[asset.location_id] = '';
        });
        // pass 2, build promises
        const typePromises = Object.keys(this.typeIds).map(id => this.typeIdToName(id));
        const locationPromises = Object.keys(this.locationIds)
          .map(id => this.locationIdToName(id));
        return Promise.all(typePromises.concat(locationPromises))
          // add the type and location names to each asset
          .then(() => assetList.map(asset => ({
            ...asset,
            type: this.typeIds[asset.type_id],
            location: this.locationIds[asset.location_id],
          })))
          .then((assets) => {
            this.stationList.other = { type: 'other', items: {} };
            // add all stations to the container list
            assets.forEach((asset) => {
              if (asset.location_type === 'station') {
                this.stationList[asset.location_id] = {
                  ...this.stationList[asset.location_id],
                  type: 'station',
                  items: {},
                  name: asset.location,
                };
              }
              // add all containers to the container list
              if (asset.type.search('ontainer') > -1) {
                this.containerList[asset.item_id] = {
                  ...this.containerList[asset.item_id],
                  type: asset.type,
                  items: {},
                };
              }
            });
            assets.forEach((asset) => {
              if (asset.location_id in this.stationList) {
                this.stationList[asset.location_id].items[asset.item_id] = asset;
              } else if (asset.location_id in this.containerList) {
                this.containerList[asset.location_id].items[asset.item_id] = asset;
              } else {
                this.stationList.other.items[asset.item_id] = asset;
              }
            });
            return { station: this.stationList, ASSETS: this.containerList };
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
