const express = require('express');
const cors = require('cors');
const corsOptions = require('../../Cors');
const Assets = require('../../model/AssetsModel');
const TokenStore = require('../../src/TokenStore');


const router = express.Router();


/* GET assets list. */
router.get('/:userId', cors(corsOptions), async (req, res) => {
  console.log('GET Assets');
  // Fetch all assets for user
  try {
    const tok = await TokenStore.get('User', req.params.userId);
    const assetsModel = new Assets();
    const info = await assetsModel.get(parseInt(req.params.userId, 10), tok);
    res.json({ info });
  } catch (error) {
    res.send({ error });
  }
});

module.exports = router;
