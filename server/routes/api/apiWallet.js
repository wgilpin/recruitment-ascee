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
    const tok = await TokenStore.get('Character', req.params.userId);
    const wallet = await Wallet.getWallet(req.params.userId, tok);
    res.json({ info: wallet });
  } catch (error) {
    res.send({ error });
  }
});


module.exports = router;
