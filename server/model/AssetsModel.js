const esi = require('eve-swagger');
const TokenStore = require('../src/TokenStore');
const EsiRequest = require('../src/EsiRequest');


class AssetsModel {
  constructor() {
    this.assetTree = {};
    this.assets = {};
    this.assetIds = [];
  }

  async getNames() {
    try {
      const esiNames = await EsiRequest.default(EsiRequest.kinds.AssetNames, this.id, [this.assetIds]);
      return esiNames[0];
    } catch (err) {
      console.log(`get names ${err.message}`);
    }
  }

  async getAssetNames() {
    try {
      const esiNames = await EsiRequest.default(
        EsiRequest.kinds.AssetNames,
        this.id,
        this.token,
        this.assetIds,
      );
      return esiNames;
    } catch (err) {
      console.log(`get names ${err.message}`);
    }
  }

  async get(userId, tok) {
    try {
      this.id = userId;
      this.token = tok;
      // read the list of assets
      // note ESI needs to point to /latest/ not /v1/
      const assetList = await esi.characters(userId, tok).assets();
      this.assetIds = [];
      assetList.forEach((asset) => {
        this.assets[asset.item_id] = asset;
        this.assetIds.push(asset.item_id);
      });
      return await this.getAssetNames();
      // add to the tree
    } catch (err) {
      console.log(`AssetModel get error ${err.message}`);
    }
  }
}

module.exports = AssetsModel;
