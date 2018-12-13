const express = require('express');

const router = express.Router();
const SSO = require('eve-singlesignon');
const users = require('../model/userModel');

const CLIENT_ID = '37de4bba039744c0a4d59cc15c9748c2';
const SECRET_KEY = 'O0q1KdspI0QRNlpX3nlSgXIGn0WJ9DOxxqj1bHrv';
const CALLBACK_URL = 'https://ascee-recruit.appspot.com/oauth-callback';

// Create a new instance with the set parameters
const sso = new SSO.SingleSignOn(CLIENT_ID, SECRET_KEY, CALLBACK_URL);

/* GET users listing. */
router.get('/', (req, res) => {
  // callback from the Eve Online SSO login screen on login
  // Get an access token for this authorization code

  let accessToken;

  sso.getAccessToken(req.query.code)
    .then((result) => {
      accessToken = result.access_token;
      console.log(`TOKEN 1st ${accessToken}`);
      return sso.verifyAccessToken(accessToken);
    })
    .then((result) => {
      console.log('RESULT', result);
      console.log(`TOKEN ${accessToken}`);
      req.session.code = req.query.code;
      // TODO: what to do with req.query.state?
      //     http://www.thread-safe.com/2014/05/the-correct-use-of-state-parameter-in.html
      const loginKind = req.query.state.split(':')[0];
      console.log(`KIND ${loginKind}  FROM   ${req.query.state}`);
      if (loginKind === 'main') {
        console.log('oauth - its a main');
        req.session.CharacterName = result.CharacterName;
        req.session.CharacterID = result.CharacterID;
      }
      console.log(`oauth callback ${result.CharacterName} ${result.CharacterID}`);
      users.update({
        id: result.CharacterID,
        name: result.CharacterName,
        token: accessToken,
        main: req.session.CharacterID,
      });
      // We now have some basic info...
      res.send(`Character ID: ${result.CharacterID}\nCharacter Name: ${result.CharacterName}`);
    })
    .catch((err) => {
      // An error occurred
      console.error('oauth error', err);
      res.send('oauth error');
    });
});

module.exports = router;
