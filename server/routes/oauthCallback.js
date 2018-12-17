const express = require('express');

const router = express.Router();
const Oauth = require('../src/Oauth');
const TokenStore = require('../src/TokenStore');
const User = require('../model/UserModel');

// Create a new instance with the set parameters
const oauth = new Oauth();

/* GET users listing. */
router.get('/', async (req, res) => {
  // callback from the Eve Online SSO login screen on login
  // Get an access token for this authorization code

  try {
    const result = await oauth.getAccessToken(req.query.code, req.query.state);
    const { name, userId, expires, accessToken, refreshToken, loginKind } = result;
    TokenStore.add(userId, refreshToken, accessToken, expires);
    const userData = {
      name,
      expires,
      main: req.session.CharacterID,
    };
    if (loginKind === 'main') {
      req.session.CharacterName = name;
      req.session.CharacterID = userId;
      userData.accessToken = accessToken;
    } else {
      // it's an alt or a main with scopes
      userData.scopeToken = accessToken;
      req.session.accessToken = accessToken;
    }

    console.log(`oauth callback ${name} ${userId}`);
    const user = new User();
    await user.get(userId);
    userData.refreshToken = refreshToken || user.values.refreshToken;
    await user.update(userData);
    req.session.save((err) => {
      if (err) {
        console.error(err);
      }
    });
    if (!user.values.scopeToken) {
      // need to request scopes
      console.log('fetch scopes');
      res.redirect('/scopes');
      return;
    }
    // We now have some basic info...
    res.render('debug', { CharacterName: req.session.CharacterName, session: req.session });
  } catch (err) {
    // An error occurred
    console.error('oauth error', err);
    res.send('oauth error');
  }
});

module.exports = router;
