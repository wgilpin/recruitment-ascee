const express = require('express');
const Mail = require('../model/mailModel');
const TokenStore = require('../src/TokenStore');

const router = express.Router();

/* GET home page. */
router.get('/:userId', async (req, res) => {
  // The main module returns a default Api instance with an attached
  // Api constructor if configuration changes are necessary.

  // Fetch all active alliance ids (could also call 'esi.alliances.all()')
  console.log(`get mail for ${req.session.CharacterID}`);
  const tok = await TokenStore.get('User', req.params.userId);
  const mails = await Mail.getMailList(req.params.userId, tok);
  res.render('mail', { mails, session: req.session });
});

module.exports = router;
