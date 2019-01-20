const express = require('express');
const cors = require('cors');
const corsOptions = require('../../Cors');
const MarketModel = require('../../model/MarketModel');
const TokenStore = require('../../src/TokenStore');


const router = express.Router();


/* GET market history list. */
router.get('/:userId', cors(corsOptions), async (req, res) => {
  console.log('GET market');
  // Fetch transactions for user
  try {
    const tok = await TokenStore.get('Character', req.params.userId);
    const trans = await MarketModel.getHistory(req.params.userId, tok);
    if (trans) {
      res.json({ info: trans });
    }
    res.json({ error: 'Market fetch error' });
    res.send(500);
  } catch (error) {
    res.send(500);
  }
});

module.exports = router;
