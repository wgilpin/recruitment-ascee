const Esi = require('../src/EsiRequest');
const TypeModel = require('../model/TypesModel');
const LocationModel = require('../model/LocationModel');
const SystemModel = require('../model/SystemModel');
const logging = require('../src/Logging');
const User = require('../model/UserModel');
const getPrice = require('./PricesModel');

// TODO: get prices - esi.types.prices()
// https://lhkbob.github.io/eve-swagger-js/Types.html#prices

class AssetsModel {
  constructor() {
    this.token = null;
    this.assetTree = {};
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

  addLocationDetails(assetList) {
    // after the details are fetched, add to the items in the list
    const assetDict = {};
    assetList.forEach((asset) => {
      const namedAsset = {
        ...asset,
        type: this.typeIds[asset.type_id],
        location: this.locationIds[asset.location_id],
        items: {},
        todo: true,
      };
      const assetSystem = (namedAsset.location || {}).system_name;
      assetDict[namedAsset.item_id] = namedAsset;
      if (assetSystem) {
        if (!(asset.location_id in assetDict)) {
          // the system wasn't in the tree
          assetDict[namedAsset.location_id] = {
            items: {},
            name: assetSystem,
            todo: true,
            location_type: 'system',
          };
        }
        if (!(namedAsset.location.name in assetDict[namedAsset.location_id].items)) {
          assetDict[namedAsset.location_id].items[namedAsset.location.name] = {
            items: {},
            location_type: 'structure',
          };
        }
      }
    });
    return assetDict;
  }


  static buildTree(assetDict) {
    /*
     * iterate items and their locations until they are all in place
     *
     * @param {Object} assetDict - items keyed by item_id
     * @returns json object holding response asset tree
     */
    //
    let changes = true;
    while (changes) {
      changes = false;
      /* eslint-disable no-loop-func */ // why?????
      Object.keys(assetDict).forEach((key) => {
        const asset = assetDict[key];
        const locId = asset.location_id;
        if (asset.todo) {
          if (locId in assetDict) {
            asset.price = getPrice(asset.type_id);
            delete asset.todo;
            const locn = asset.location.name;
            if (locn in assetDict[locId].items) {
              // a structure: store asset in system>structure>items
              assetDict[locId].items[locn].items[asset.item_id] = asset;
            } else {
              assetDict[locId].items[asset.item_id] = asset;
            }
            changes = true;
          }
        }
      });
    }
    // clean and build result
    const res = {};
    Object.keys(assetDict).forEach((key) => {
      if (assetDict[key].todo) {
        delete assetDict[key].todo;
        res[key] = assetDict[key];
      }
    });
    // assets.orphan = assets.filter(item => !!item.todo);
    return res;
  }

  buildLocationLists(assetList) {
    // create lists of things needing lookup - item type & location.
    assetList.forEach((asset) => {
      this.typeIds[asset.type_id] = '';
      this.locationIds[asset.location_id] = '';
    });
    return assetList;
  }

  async get(userId) {
    this.id = userId;
    // force price cache load
    getPrice(0);
    this.user = new User();
    await this.user.get(userId);
    this.token = this.user.values.accessToken;

    // read the list of assets
    // note ESI needs to point to /latest/ not /v1/
    return Esi.get(Esi.kinds.Assets, userId, this.token, 1).then((response) => {
      try {
        // const assetList = response.body.sort((a, b) => a.location_id - b.location_id);
        // pass 1 - get list of ids
        const assetList = this.buildLocationLists(response.body);
        // build promises
        const typePromises = Object.keys(this.typeIds).map(id => this.getTypeName(id));
        const locationPromises = Object.keys(this.locationIds)
          .map(id => this.getLocationInfo(id));
        // resolve all the promises
        return Promise.all(typePromises.concat(locationPromises))
          .then(() => {
            // pass 2 add the type and location names to each asset
            const assets = this.addLocationDetails(assetList);
            // pass 3 build the tree
            return AssetsModel.buildTree(assets);
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
