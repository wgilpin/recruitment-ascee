const express = require('express');
const cors = require('cors');
const corsOptions = require('../../Cors');
const Wallet = require('../../model/WalletModel');
const TokenStore = require('../../src/TokenStore');


const router = express.Router();


/* GET alts list. */
router.get('/:userId', cors(corsOptions), async (req, res) => {
  console.log('GET wallet');
  // Fetch wallet for user
  try {
    const tok = await TokenStore.get('User', req.params.userId);
    const mails = await Mail.getMailList(req.params.userId, tok);
    res.json({ info: mails });
  } catch (error) {
    res.send({ error });
  }
});


module.exports = router;
