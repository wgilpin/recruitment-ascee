const express = require('express');

const router = express.Router();
const SSO = require('eve-singlesignon');
const User = require('../model/UserModel');

const CLIENT_ID = '37de4bba039744c0a4d59cc15c9748c2';
const SECRET_KEY = 'O0q1KdspI0QRNlpX3nlSgXIGn0WJ9DOxxqj1bHrv';
const CALLBACK_URL = 'https://ascee-recruit.appspot.com/oauth-callback';

// Create a new instance with the set parameters
const sso = new SSO.SingleSignOn(CLIENT_ID, SECRET_KEY, CALLBACK_URL);

/* GET users listing. */
router.get('/', async (req, res) => {
  // callback from the Eve Online SSO login screen on login
  // Get an access token for this authorization code

  let accessToken;
  try {
    const result = await sso.getAccessToken(req.query.code);
    accessToken = result.access_token;
    const now = new Date();
    const expirationTime = now.setSeconds(now.getSeconds() + result.expires_in);
    const verification = await sso.verifyAccessToken(accessToken);
    req.session.code = req.query.code;
    // TODO: what to do with req.query.state?
    //     http://www.thread-safe.com/2014/05/the-correct-use-of-state-parameter-in.html
    const loginKind = req.query.state.split(':')[0].trim();
    if (loginKind === 'main') {
      console.log('oauth - its a main');
      req.session.CharacterName = verification.CharacterName;
      req.session.CharacterID = verification.CharacterID;
    }
    console.log(`oauth callback ${verification.CharacterName} ${verification.CharacterID}`);
    const user = new User();
    await user.get(verification.CharacterID);
    await user.update({
      name: verification.CharacterName,
      accessToken,
      refreshToken: result.refresh_token || user.values.refreshToken,
      expires: expirationTime,
      main: req.session.CharacterID,
      hasScopes: user.values.hasScopes || verification.Scopes.length > 0,
    });
    if (!user.values.hasScopes) {
      // need to request scopes
      console.log('fetch scopes');
      res.redirect('/scopes');
      return;
    }
    // We now have some basic info...
    res.send(`Character ID: ${result.CharacterID}\nCharacter Name: ${result.CharacterName}`);
  } catch (err) {
    // An error occurred
    console.error('oauth error', err);
    res.send('oauth error');
  }
});

module.exports = router;
