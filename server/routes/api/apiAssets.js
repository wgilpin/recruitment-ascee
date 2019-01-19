const express = require('express');
const cors = require('cors');
const corsOptions = require('../../Cors');
const Assets = require('../../model/AssetsModel');
const TokenStore = require('../../src/TokenStore');
const logging = require('../../src/Logging');


const router = express.Router();


/* GET assets list. */
router.get('/:userId', cors(corsOptions), async (req, res) => {
  logging.log('GET Assets');
  // Fetch all assets for user
  try {
    const tok = await TokenStore.get('Character', req.params.userId);
    const assetsModel = new Assets();
    const info = await assetsModel.get(parseInt(req.params.userId, 10), tok);
    res.json({ info });
  } catch (error) {
    TokenStore.updateAccessToken('Character', req.params.userId);
    res.send({ error });
  }
});

/* GET assets list. */
router.get('/blueprints/:userId', cors(corsOptions), async (req, res) => {
  logging.log('GET Blueprints');
  // Fetch all bps for user
  try {
    const tok = await TokenStore.get('Character', req.params.userId);
    const assetsModel = new Assets();
    const info = await assetsModel.getBlueprints(parseInt(req.params.userId, 10), tok);
    res.json({ info });
  } catch (error) {
    res.send({ error });
  }
});

module.exports = router;
