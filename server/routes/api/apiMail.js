const express = require('express');
const cors = require('cors');
const corsOptions = require('../../Cors');
const Mail = require('../../model/MailModel');
const TokenStore = require('../../src/TokenStore');


const router = express.Router();


/* GET alts list. */
router.get('/:userId', cors(corsOptions), async (req, res) => {
  console.log('GET mail');
  // Fetch all mail for user
  try {
    const tok = await TokenStore.get('User', req.params.userId);
    const mails = await Mail.getMailList(req.params.userId, tok);
    res.json({ info: mails });
  } catch (error) {
    res.send({ error });
  }
});

/* GET mail body. */
router.get('/:userId/:mailId', cors(corsOptions), async (req, res) => {
  // Fetch mail body
  try {
    console.log(`get mail body ${req.params.mailId} for ${req.params.userId}`);
    const tok = await TokenStore.get('User', req.params.userId);
    const mail = await Mail.getMailBody(req.params.userId, req.params.mailId, tok);
    res.json({ info: mail.body });
  } catch (error) {
    res.send({ error });
  }
});


module.exports = router;
