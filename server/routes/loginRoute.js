const express = require('express');

const router = express.Router();

const CLIENT_ID = '37de4bba039744c0a4d59cc15c9748c2';
const CALLBACK_URL = 'http://localhost:3000/oauth-callback';
// const CALLBACK_URL = 'https://ascee-recruit.appspot.com/oauth-callback';
const LOGIN_URL = 'https://login.eveonline.com/oauth/authorize/';
const SCOPES = 'publicData esi-mail.read_mail.v1 esi-wallet.read_character_wallet.v1 esi-clones.read_clones.v1 esi-characters.read_contacts.v1 esi-bookmarks.read_character_bookmarks.v1 esi-characters.read_chat_channels.v1 esi-characters.read_medals.v1 esi-characters.read_agents_research.v1 esi-industry.read_character_jobs.v1 esi-markets.read_character_orders.v1 esi-characters.read_blueprints.v1 esi-characters.read_corporation_roles.v1 esi-contracts.read_character_contracts.v1 esi-clones.read_implants.v1 esi-industry.read_character_mining.v1 esi-characters.read_titles.v1 esi-characterstats.read.v1';

const getState = prefix => `
  ${prefix}:
  ${Math.random()
    .toString(36)
    .substring(2, 15)}
  ${Math.random()
    .toString(36)
    .substring(2, 15)}`;

const dictToQueryString = dict => Object.keys(dict).reduce(
  (acc, key, idx) => `${acc}${idx > 0 ? '&' : '?'}${key}=${dict[key]}`,
  '',
);

const getLoginUrl = (state, scope = '') => {
  // eve login
  const params = {
    redirect_uri: CALLBACK_URL,
    client_id: CLIENT_ID,
    response_type: 'code',
    state,
    scope,
  };
  return LOGIN_URL + dictToQueryString(params);
};

const updateOauthState = (req, state) => {
  if (
    req.session.oauthStates
    && req.session.oauthStates.indexOf(state) === 1
  ) {
    req.session.oauthStates.append(state);
    console.log(`added state to session ${state}`);
  }
};

/* GET login page for a main */
router.get('/', (req, res) => {
  const state = getState('main');
  const url = getLoginUrl(state);
  updateOauthState(req, state);
  console.log(`login redirect to ${url}`);
  res.redirect(url);
});

/* GET login page for adding an alt */
router.get('/alt', (req, res) => {
  const state = getState('alt');
  const url = getLoginUrl(state, SCOPES);
  updateOauthState(req, state);
  console.log(`login redirect to ${url}`);
  res.redirect(url);
});

module.exports = router;
