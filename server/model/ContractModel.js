/* eslint-disable camelcase */
const NameCache = require('./NameCache');
const Esi = require('../src/EsiRequest');
const logging = require('../src/Logging');

class ContractModel {
  static async stringCompare(a, b) {
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  }

  static processPromises(names, contactDict) {
    const lookup = {};
    names.forEach((data) => {
      lookup[data.id] = data;
    });
    Object.keys(contactDict).forEach((key) => {
      // contactDict[key].name = lookup[contactDict[key].character_id];
      contactDict[key].corp = (
        lookup[contactDict[key].corporation_id] || {}
      ).name;
      contactDict[key].alliance = (
        lookup[contactDict[key].alliance_id] || {}
      ).name;
    });
    const arr = Object.keys(contactDict).map(key => contactDict[key]);
    const sortedArr = arr.sort((a, b) => ContractModel.stringCompare(a.name, b.name));
    return sortedArr;
  }

  static getData(contractData, identifier, lookup) {
    const id = `${identifier}_id`;
    if (contractData[id]) {
      contractData[identifier] = lookup[id];
    }
    return contractData;
  }

  static async get(userId, token) {
    try {
      try {
        const response = await Esi.get(Esi.kinds.Contracts, userId, token);
        const contracts = response.body;
        const unknown = {};
        contracts.forEach((contract) => {
          if (contract.issuer_corporation_id) {
            unknown[contract.issuer_corporation_id] = NameCache.getKinds().Corporation;
          }
          if (contract.acceptor_id) {
            unknown[contract.acceptor_id] = NameCache.getKinds().CharacterPlusCorp;
          }
          if (contract.issuer_id) {
            unknown[contract.issuer_id] = NameCache.getKinds().CharacterPlusCorp;
          }
          if (contract.end_location_id) {
            unknown[contract.end_location_id] = NameCache.getKinds().Location;
          }
          if (contract.start_location_id) { unknown[contract.start_location_id] = NameCache.getKinds().Location; }
        });
        const namePromises = Object.keys(unknown).map(id => NameCache.get(id, unknown[id]));
        return Promise.all(namePromises).then((names) => {
          const lookup = {};
          names.forEach((nameRecord) => {
            const {
              id, name, corporation_id, alliance_id,
            } = nameRecord;
            lookup[id] = {
              name,
              corporation_id,
              alliance_id,
            };
          });
          const result = contracts.map(c => ({
            ...c,
            issuer_corporation: ContractModel.getData(c, 'issuer_corporation', lookup),
            acceptor: ContractModel.getData(c, 'acceptor', lookup),
            issuer: ContractModel.getData(c, 'issuer', lookup),
            end_location: ContractModel.getData(c, 'end_location', lookup),
            start_location: ContractModel.getData(c, 'start_location', lookup),
          }));
          return result;
        });
      } catch (err) {
        console.error(err);
        return {};
      }
    } catch (err) {
      console.error(err);
      return {};
    }
  }
}

module.exports = ContractModel;
