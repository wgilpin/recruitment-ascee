const request = require('request-promise-native');
const logging = require('./Logging');

/*
  this module is for calls to esi that eve-swagger doesn't cover

  Asset Names
  Wallet Journal
*/

const EsiKinds = {
  // supported esi calls
  AssetNames: 'AssetNames',
  WalletJournal: 'WalletJournal',
  Assets: 'Assets',
  Structure: 'Structure',
  System: 'System',
  Prices: 'Prices',
  Character: 'Character',
  CharacterPortrait: 'CharacterPortrait',
  Types: 'Types',
  MailHeaders: 'MailHeaders',
  MailBody: 'MailBody',
};

const EsiMaps = {
  // map the params to the url format
  // AssetNames 0: userId, 1: token, 2: [asset_ids]
  AssetNames: { method: 'POST', url: 'characters/{0}/assets/names?datasource=tranquility' },
  // WalletJournal 0: userId, 1: token
  WalletJournal: { method: 'GET', url: 'characters/{0}/wallet/journal?datasource=tranquility' },
  // MailHeaders 0: userId, 1: token
  MailHeaders: { method: 'GET', url: 'characters/{0}/mail?datasource=tranquility' },
  // MailBody 0: userId, 1: token, 2 mailId
  MailBody: { method: 'GET', url: 'characters/{0}/mail/{2}?datasource=tranquility' },
  // Assets 0: userId, 1: token, 2: page
  Assets: { method: 'GET', url: 'characters/{0}/assets?datasource=tranquility&page={2}' },
  // Structure 0: structureId, 1: token
  Structure: { method: 'GET', url: 'universe/structures/{0}/?datasource=tranquility' },
  // System 0: systemId
  System: { method: 'GET', url: 'universe/systems/{0}/?datasource=tranquility' },
  // Types 0: typeId
  Types: { method: 'GET', url: 'universe/types/{0}/?datasource=tranquility' },
  // Character 0: charId
  Character: { method: 'GET', url: 'characters/{0}/?datasource=tranquility' },
  // Character 0: charId
  CharacterPortrait: { method: 'GET', url: 'characters/{0}/portrait?datasource=tranquility' },
  // System 0: systemId
  Prices: { method: 'GET', url: 'markets/prices/?datasource=tranquility' },
};

function format(formatString, args) {
  // this is a basic formatter - format("abc{0}def{1}jkl",['111', '222']) -> "abc111def222jkl"
  return formatString.replace(/{(\d+)}/g, (match, number) => (typeof args[number] !== 'undefined'
    ? args[number]
    : match));
}

function makeUrl(kind, params) {
  const frag = EsiMaps[kind];
  const newFrag = format(frag.url, params);
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
