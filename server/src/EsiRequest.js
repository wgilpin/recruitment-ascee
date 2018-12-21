const request = require('request-promise-native');

/*
  this module is for calls to esi that eve-swagger doesn't cover

  Asset Names
  Wallet Journal
*/

const EsiKinds = {
  // supported esi calls
  AssetNames: 'AssetNames',
  WalletJournal: 'WalletJournal',
};

const EsiMaps = {
  // map the params to the url format
  // AssetNames 0: userId, 1: token, 2: [asset_ids]
  AssetNames: { method: 'POST', url: 'characters/{0}/assets/names?datasource=tranquility' },
  // WalletJournal 0: userId, 1: token
  WalletJournal: { method: 'GET', url: 'characters/{0}/wallet/journal?datasource=tranquility' },
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
  // https://esi.evetech.net/latest/#!/Wallet/get_characters_character_id_wallet_transactions
  // curl -i --compressed -X GET --header  'https://esi.evetech.net/latest/characters/93207621/wallet/?datasource=tranquility&token=lXJwp2lbZH4bmrexqOFnurkmkznjLhE4vDbcfpofFNvKYBn2ygGkS3eQyMHAn77EN129iwRqyr4KXvIWRMZXaQ2'
  // wallet = await esi.characters(parseInt(userId, 10), token);
  try {
    const { url, method, params } = makeUrl(kind, rest);
    const response = await request({
      method,
      url,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: params ? params[0] : null,
      json: true,
    });
      // load the names
      // eslint-disable-next-line no-restricted-syntax
    return response;
  } catch (err) {
    console.log(err.message);
    return false;
  }
}

module.exports.default = esiRequest;
module.exports.kinds = EsiKinds;
