/* eslint-disable camelcase */
const NameCache = require('./NameCache');
const Esi = require('../src/EsiRequest');
const logging = require('../src/Logging');

class ContactsModel {
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
      contactDict[key].corp = (lookup[contactDict[key].corporation_id] || {}).name;
      contactDict[key].alliance = (lookup[contactDict[key].alliance_id] || {}).name;
    });
    const arr = Object.keys(contactDict).map(key => contactDict[key]);
    const sortedArr = arr.sort((a, b) => ContactsModel.stringCompare(a.name, b.name));
    return sortedArr;
  }

  static async get(userId, token) {
    try {
      try {
        const response = await Esi.get(Esi.kinds.Contacts, userId, token);
        const contacts = response.body;
        const namePromises = [];
        contacts.forEach((contact) => {
          namePromises.push(NameCache.get(contact.contact_id, NameCache.getKinds().Character));
        });
        const contactDict = {};
        contacts.forEach((contact) => {
          contactDict[contact.contact_id] = contact;
        });
        return Promise.all(namePromises).then((names) => {
          const corpPromises = [];
          names.forEach((nameRecord) => {
            const { id, name, corporation_id, alliance_id } = nameRecord;
            contactDict[id] = {
              ...contactDict[id],
              name,
              corporation_id,
              alliance_id,
            };
            corpPromises.push(NameCache.get(corporation_id, NameCache.getKinds().Corporation));
            if (alliance_id) {
              corpPromises.push(NameCache.get(alliance_id, NameCache.getKinds().Alliance));
            }
          });
          return Promise
            .all(corpPromises)
            .then(corps => ContactsModel.processPromises(corps, contactDict));
        });
      } catch (err) {
        logging.error(`fetch contacts ${err.message}`);
        return {};
      }
    } catch (err) {
      logging.error(`contactsModel get ${err.message}`);
      return {};
    }
  }
}

module.exports = ContactsModel;
