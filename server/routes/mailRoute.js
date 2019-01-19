const express = require('express');
const Mail = require('../model/MailModel');
const TokenStore = require('../src/TokenStore');

const router = express.Router();

/* GET mail list for user. */
router.get('/:userId', async (req, res) => {
  // The main module returns a default Api instance with an attached
  // Api constructor if configuration changes are necessary.

  // Fetch all active alliance ids (could also call 'esi.alliances.all()')
  console.log(`get mail for ${req.params.userId}`);
  const tok = await TokenStore.get('Character', req.params.userId);
  const mails = await Mail.getMailList(req.params.userId, tok);
  res.render('mail', { mails, session: req.session });
});

/* GET mail body. */
router.get('/:userId/:mailId', async (req, res) => {
  // The main module returns a default Api instance with an attached
  // Api constructor if configuration changes are necessary.

  // Fetch all active alliance ids (could also call 'esi.alliances.all()')
  console.log(`get mail body ${req.params.mailId} for ${req.params.userId}`);
  const tok = await TokenStore.get('Character', req.params.userId);
  const mail = await Mail.getMailBody(req.params.userId, tok, req.params.mailId);
  res.render('mail', { mail, session: req.session });
});

module.exports = router;
