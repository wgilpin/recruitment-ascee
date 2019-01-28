const express = require('express');

const router = express.Router();
const Oauth = require('../src/Oauth');
const TokenStore = require('../src/TokenStore');
const Character = require('../model/CharacterModel');

/* GET users listing. */
router.get('/', async (req, res) => {
  /* callback from the Eve Online SSO login screen on login
    * we get an access code, and the state variable we passed to it in the callback URL
    * note the state token we supplied to the eve oauth via the url is in two parts:
    *    either 'main:' or 'alt:'
    *    plus a random token string
    * main for when this was a main char login (eg from the homepage)
    * alt for an alt - eg when applicant clicks 'add alt'
    * We need to know so we can redirect the user to the right but of the app after
    */

  // Get an access token for this authorization code
  try {
    // get access token & other data from callback code 7 state
    const result = await Oauth.getAccessToken(req.query.code, req.query.state);
    const {
      name, userId, expires, accessToken, refreshToken, loginKind,
    } = result;
    // store the token
    TokenStore.add(userId, refreshToken, accessToken, expires);
    const userData = {
      name,
      expires,
      main: req.session.mainId,
    };
    if (loginKind === 'main') {
      // this character was logging in as a main, not just adding an alt
      // store useful data in session
      req.session.CharacterName = name;
      // mainId is the main of the current user
      req.session.mainId = userId;
      // loggedInId is which character is actually logged in
      req.session.loggedInId = userId;
      userData.accessToken = accessToken;
    } else if (loginKind === 'alt') {
      // update the alt record
      const alt = new Character();
      await alt.get(userId);
      userData.refreshToken = refreshToken || alt.values.refreshToken;
      userData.main = req.session.mainId || alt.values.main;
      // req.session.loggedInId = userId;
      await alt.update(userData);
    } else {
      // it's an alt or a main but we've just added scopes
      userData.scopeToken = accessToken;
      req.session.accessToken = accessToken;
    }
    // save the refresh token if we have one
    console.log(`oauth callback ${name} ${userId}`);
    const char = new Character();
    await char.get(userId);
    char.values.refreshToken = refreshToken || char.values.refreshToken;
    await char.save();
    req.session.save((err) => {
      if (err) {
        console.error(err);
      }
    });
    if (char.values.isRecruiter || char.values.isSnrRecruiter) {
      // go to recruiter page
      console.log('recruiter logged in');
      res.redirect('/app?showing=recruiter');
      return;
    }
    // not a recruiter - go to the applicant page
    res.redirect('/app?showing=applicant');
  } catch (err) {
    // An error occurred
    console.error('oauth error', err);
    res.send('oauth error');
  }
});

module.exports = router;
