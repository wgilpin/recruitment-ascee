const express = require('express');

const router = express.Router();
const Oauth = require('../src/Oauth');
const TokenStore = require('../src/TokenStore');
const User = require('../model/UserModel');
const Character = require('../model/CharacterModel');

/* GET users listing. */
router.get('/', async (req, res) => {
  // callback from the Eve Online SSO login screen on login
  // Get an access token for this authorization code

  try {
    const result = await Oauth.getAccessToken(req.query.code, req.query.state);
    const {
      name, userId, expires, accessToken, refreshToken, loginKind,
    } = result;
    // if (!refreshToken) {
    //   result = await Oauth.refreshToken(accessToken, true);
    // }
    TokenStore.add(userId, refreshToken, accessToken, expires);
    const userData = {
      name,
      expires,
      main: req.session.mainId,
    };
    if (loginKind === 'main') {
      req.session.CharacterName = name;
      // mainId is the main of the current user
      req.session.mainId = userId;
      // loggedInId is which character is actually logged in
      req.session.loggedInId = userId;
      userData.accessToken = accessToken;
    } if (loginKind === 'alt') {
      const alt = new Character();
      alt.get(userId);
      userData.refreshToken = refreshToken || alt.values.refreshToken;
      userData.main = req.session.mainId || alt.values.main;
      req.session.loggedInId = userId;
      await alt.update(userData);
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
    if (user.values.isRecruiter || user.values.isSnrRecruiter) {
      // go to recruiter page
      console.log('recruiter logged in');
      res.redirect('/app?showing=recruiter');
      return;
    }
    if (!user.values.scopeToken) {
      // need to request scopes
      console.log('fetch scopes');
      res.redirect('/scopes');
      return;
    }
    res.redirect('/app?showing=applicant');
  } catch (err) {
    // An error occurred
    console.error('oauth error', err);
    res.send('oauth error');
  }
});

module.exports = router;
