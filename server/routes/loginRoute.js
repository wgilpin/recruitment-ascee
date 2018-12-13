const express = require('express');

const router = express.Router();

const CLIENT_ID = '37de4bba039744c0a4d59cc15c9748c2';
const CALLBACK_URL = 'http://localhost:3000/oauth-callback';
// const CALLBACK_URL = 'https://ascee-recruit.appspot.com/oauth-callback';
const LOGIN_URL = 'https://login.eveonline.com/oauth/authorize/';

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

const getLoginUrl = (state) => {
  // eve login
  const params = {
    redirect_uri: CALLBACK_URL,
    client_id: CLIENT_ID,
    response_type: 'code',
    state,
    scope: '',
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
  const url = getLoginUrl(state);
  updateOauthState(req, state);
  console.log(`login redirect to ${url}`);
  res.redirect(url);
});

module.exports = router;
