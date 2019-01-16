/* eslint-disable camelcase */
const NameCache = require('./NameCache');
const Esi = require('../src/EsiRequest');
const logging = require('../src/Logging');

class BookmarksModel {
  static async get(userId, token) {
    try {
      const folderList = await Esi.get(Esi.kinds.BookmarkFolders, userId, token);
      const folders = {};
      folderList.body.forEach((folder) => {
        folders[folder.folder_id] = folder;
        if (folder.name === 'Null') {
          folders[folder.folder_id].name = 'Personal Locations';
        }
      });
      try {
        const response = await Esi.get(Esi.kinds.Bookmarks, userId, token);
        const bms = response.body;
        let namePromises = [];
        const lookupSystems = {};
        bms.forEach((bm) => {
          if (bm.location_id >= 30000000 && bm.location_id <= 32000000) {
            lookupSystems[bm.location_id] = '';
            // a system
          } else {
            logging.error(`Bookmark location not a system ${bm.location_id}`);
          }
          namePromises = Object.keys(lookupSystems).map(
            key => NameCache.get(key, NameCache.getKinds().System),
          );
        });
        const bmDict = {};
        bms.forEach((bm) => {
          // needs an id field
          bmDict[bm.bookmark_id] = { ...bm, id: bm.bookmark_id };
        });
        return Promise.all(namePromises).then((names) => {
          // build a system names dict
          const systemNames = {};
          names.forEach((name) => { systemNames[name.id] = name; });
          Object.keys(bmDict).forEach((bmKey) => {
            // add folder name
            bmDict[bmKey].folder = folders[bmDict[bmKey].folder_id].name;
            // add systems name
            bmDict[bmKey].system = systemNames[bmDict[bmKey].location_id].name;
          });
          return bmDict;
        });
      } catch (err) {
        logging.error(`fetch contacts ${err.message}`);
        return {};
      }
    } catch (err) {
      logging.error(`BookmarksModel get ${err.message}`);
      return {};
    }
  }
}

module.exports = BookmarksModel;
