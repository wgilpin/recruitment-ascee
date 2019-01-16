const express = require('express');
const cors = require('cors');
const corsOptions = require('../../Cors');
const BookmarksModel = require('../../model/BookmarksModel');
const TokenStore = require('../../src/TokenStore');


const router = express.Router();


/* GET alts list. */
router.get('/:userId', cors(corsOptions), async (req, res) => {
  console.log('GET wallet');
  // Fetch wallet for user
  try {
    const tok = await TokenStore.get('User', req.params.userId);
    const bms = await BookmarksModel.get(req.params.userId, tok);
    res.json({ info: bms });
  } catch (error) {
    res.send({ error });
  }
});


module.exports = router;
