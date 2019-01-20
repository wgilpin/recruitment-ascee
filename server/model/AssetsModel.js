const Esi = require('../src/EsiRequest');
const TypeModel = require('../model/TypesModel');
const LocationModel = require('../model/LocationModel');
const NameCache = require('../model/NameCache');
const SystemModel = require('../model/SystemModel');
const logging = require('../src/Logging');
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
          logging.error(`typeIdToName error ${err.message} for id ${id}`);
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

  addLocationDetails(assetList, addSystems) {
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
      if (assetSystem && addSystems) {
        if (!(asset.location_id in assetDict)) {
          // the system wasn't in the tree
          assetDict[namedAsset.location_id] = {
            items: {},
            name: assetSystem,
            todo: true,
            location_type: 'system',
          };
        }
        if (
          !(namedAsset.location.name in assetDict[namedAsset.location_id].items)
        ) {
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
      changes = false; // why?????
      /* eslint-disable no-loop-func */ Object.keys(assetDict).forEach((key) => {
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

  async getAllPages() {
    let allPagesLoaded = false;
    let allResponses = [];
    let page = 1;
    while (!allPagesLoaded) {
      // eslint-disable-next-line no-await-in-loop
      const response = await Esi.get(
        Esi.kinds.Assets,
        this.id,
        this.token,
        page,
      );
      allResponses = allResponses.concat(response.body);
      page += 1;
      if (page >= parseInt(response.headers['x-pages'], 10)) {
        allPagesLoaded = true;
      }
    }
    return allResponses;
  }

  async get(userId, tok) {
    this.id = userId;
    // force price cache load
    getPrice(0);
    this.token = tok;

    // read the list of assets
    // note ESI needs to point to /latest/ not /v1/
    const allResponses = await this.getAllPages();
    try {
      // const assetList = response.body.sort((a, b) => a.location_id - b.location_id);
      // pass 1 - get list of ids
      const assetList = this.buildLocationLists(allResponses);
      // build promises
      const typePromises = Object.keys(this.typeIds).map(id => this.getTypeName(id));
      const locationPromises = Object.keys(this.locationIds).map(id => this.getLocationInfo(id));
      // resolve all the promises
      return Promise.all(typePromises.concat(locationPromises)).then(() => {
        // pass 2 add the type and location names to each asset
        const assets = this.addLocationDetails(assetList, true);
        // pass 3 build the tree
        return AssetsModel.buildTree(assets);
      });
    } catch (err) {
      logging.error(`AssetModel get ${err.message}`);
      return false;
    }
  }

  async getBlueprints(userId, tok) {
    this.id = userId;
    this.token = tok;

    // read the list of assets
    // note ESI needs to point to /latest/ not /v1/
    const response = await this.getAllPages();
    try {
      const assetNodes = {};
      const typesNeeded = {};
      response.forEach((asset) => {
        typesNeeded[asset.type_id] = '';
        assetNodes[asset.item_id] = asset;
      });
      const typePromises = Object.keys(typesNeeded).map((id) => {
        const typeRecord = new TypeModel();
        return typeRecord.get(id);
      });
      return Promise.all(typePromises).then((data) => {
        data.forEach((item) => {
          // only save blueprints
          if (item.name.indexOf('lueprint') > -1) {
            this.typeIds[item.id] = item.name;
          }
        });
        const bps = response.filter(asset => asset.type_id in this.typeIds);
        // pass 1 - get list of ids
        bps.forEach((asset) => {
          console.log('item', asset.item_id)
          let node = asset;
          while (node) {
            asset.system_id = node.location_id;
            node = assetNodes[node.location_id];
            console.log('up', asset.location_id)

          }
          this.locationIds[asset.location_id] = '';
          this.locationIds[asset.system_id] = '';
          console.log('location', asset.system_id)
        });
        // build promises
        const locationPromises = Object
          .keys(this.locationIds)
          .map(id => NameCache.getLocation(id, this.token));
        // resolve all the promises
        return Promise.all(locationPromises)
          .then((locations) => {
            const lookupSystems = {};
            locations.forEach((location) => {
              lookupSystems[(location || {}).system_id] = '';
              this.locationIds[(location || {}).id] = location;
            });
            const systemPromises = Object
              .keys(lookupSystems)
              .map(key => NameCache.getLocation(key, this.token));
            return Promise.all(systemPromises)
              .then((systems) => {
                systems.forEach((system) => {
                  this.locationIds[(system || {}).id] = system;
                });
                // pass 2 add the type and location names to each asset
                const namedAssets = bps.map((asset) => {
                  let location = (this.locationIds[asset.location_id] || {}).name;
                  if (!location) {
                    location = (this.locationIds[asset.system_id] || {}).name;
                  }
                  return {
                    ...asset,
                    type: this.typeIds[asset.type_id],
                    location,
                    location_full: this.locationIds[asset.location_id],
                  };
                });
                return namedAssets;
              });
          });
      });
    } catch (err) {
      logging.error(`AssetModel Blueprints get ${err.message}`);
      return { error: err.message };
    }

    // add to the tree
  }
}

module.exports = AssetsModel;
