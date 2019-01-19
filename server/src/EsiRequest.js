const request = require('request-promise-native');
const logging = require('./Logging');

/*
  this module is for calls to esi that eve-swagger doesn't cover

  Asset Names
  Wallet Journal
*/

const EsiKinds = {
  // supported esi calls
  Alliance: 'Alliance',
  Assets: 'Assets',
  AssetNames: 'AssetNames',
  Bookmarks: 'Bookmarks',
  BookmarkFolders: 'BookmarkFolders',
  Calendar: 'Calendar',
  CalendarAttendees: 'CalendarAttendees',
  CalendarDetails: 'CalendarDetails',
  Character: 'Character',
  CharacterPortrait: 'CharacterPortrait',
  Contacts: 'Contacts',
  Contracts: 'Contracts',
  Constellation: 'Constellation',
  Corporation: 'Corporation',
  Location: 'Location',
  MailHeaders: 'MailHeaders',
  MailBody: 'MailBody',
  MarketHistory: 'MarketHistory',
  Prices: 'Prices',
  Skills: 'Skills',
  Structure: 'Structure',
  System: 'System',
  Types: 'Types',
  WalletJournal: 'WalletJournal',
};

const EsiMaps = {
  // map the params to the url format
  // AssetNames 0: userId, 1: token, 2: [asset_ids]
  AssetNames: { method: 'POST', url: 'characters/{0}/assets/names?' },
  // Bookmarks 0: userId, 1: token
  Bookmarks: { method: 'GET', url: 'characters/{0}/bookmarks?' },
  // BookmarkFolders 0: userId, 1: token
  BookmarkFolders: { method: 'GET', url: 'characters/{0}/bookmarks/folders/?' },
  // Calendar 0: userId, 1: token
  Calendar: { method: 'GET', url: 'characters/{0}/calendar/?' },
  // Location 0: userId, 1: event id
  CalendarDetails: { method: 'GET', url: 'characters/{0}/calendar/{2}?' },
  // Location 0: userId, 1: event id
  CalendarAttendees: { method: 'GET', url: 'characters/{0}/calendar/{2}/attendees?' },
  // Character 0: charId
  Contacts: { method: 'GET', url: 'characters/{0}/contacts?' },
  // Character 0: charId
  Contracts: { method: 'GET', url: 'characters/{0}/contracts?' },
  // Location 0: locationId
  Constellation: { method: 'GET', url: 'universe/constellations/{0}?' },
  // WalletJournal 0: userId, 1: token
  WalletJournal: { method: 'GET', url: 'characters/{0}/wallet/journal?' },
  // MailHeaders 0: userId, 1: token
  MailHeaders: { method: 'GET', url: 'characters/{0}/mail?' },
  // MailBody 0: userId, 1: token, 2 mailId
  MailBody: { method: 'GET', url: 'characters/{0}/mail/{2}?' },
  // MarketHistory 0: userId, 1: token
  MarketHistory: { method: 'GET', url: 'characters/{0}/orders/?' },
  // Assets 0: userId, 1: token, 2: page
  Assets: { method: 'GET', url: 'characters/{0}/assets?page={2}&' },
  // Structure 0: structureId, 1: token
  Structure: { method: 'GET', url: 'universe/structures/{0}/?' },
  // System 0: systemId
  System: { method: 'GET', url: 'universe/systems/{0}/?' },
  // Types 0: typeId
  Types: { method: 'GET', url: 'universe/types/{0}/?' },
  // Character 0: charId
  Character: { method: 'GET', url: 'characters/{0}/?' },
  // Character 0: charId
  CharacterPortrait: { method: 'GET', url: 'characters/{0}/portrait?' },
  // Alliance 0: alliance_id
  Alliance: { method: 'GET', url: 'alliances/{0}?' },
  // Corporation 0: corp_id
  Corporation: { method: 'GET', url: 'corporations/{0}?' },
  // Character 0: charId
  Skills: { method: 'GET', url: 'characters/{0}/skills?' },
  // System 0: systemId
  Prices: { method: 'GET', url: 'markets/prices/?' },
};

function format(formatString, args) {
  // this is a basic formatter - format("abc{0}def{1}jkl",['111', '222']) -> "abc111def222jkl"
  return formatString.replace(/{(\d+)}/g, (match, number) => (typeof args[number] !== 'undefined'
    ? args[number]
    : match));
}

function makeUrl(kind, params) {
  const frag = EsiMaps[kind];
  // eslint-disable-next-line prefer-template
  const newFrag = format(frag.url, params) + 'datasource=tranquility';
  const [, token, ...rest] = params;
  let url = `https://esi.evetech.net/latest/${newFrag}`;
  if (token) {
    url = `${url}&token=${token}`;
  }
  const res = { method: frag.method, url };
  if (frag.method === 'POST') {
    res.params = rest;
  }
  return res;
}

async function esiRequest(kind, ...rest) {
  try {
    const { url, method, params } = makeUrl(kind, rest);
    logging.debug(`call url ${url}`);
    logging.debug(`esiRequest tok ${rest[1]}`);
    return request({
      method,
      url,
      resolveWithFullResponse: true,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: params ? params[0] : null,
      json: true,
    });
  } catch (err) {
    logging.error(`EsisRequest ${err.message}`);
    return false;
  }
}

module.exports.get = esiRequest;
module.exports.kinds = EsiKinds;
