const express = require('express');
const Mail = require('../model/mailModel');
const User = require('../model/UserModel');

const router = express.Router();

/* GET home page. */
router.get('/', async (req, res) => {
  // The main module returns a default Api instance with an attached
  // Api constructor if configuration changes are necessary.

  // Fetch all active alliance ids (could also call 'esi.alliances.all()')
  console.log(`get mail for ${req.session.CharacterID}`);
  const user = new User();
  await user.get(req.session.CharacterID);
  const mails = Mail.getMailList(req.session.CharacterID, user.token);
  res.render('mail', { mails });
});

module.exports = router;
