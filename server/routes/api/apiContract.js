const express = require('express');
const cors = require('cors');
const corsOptions = require('../../Cors');
const ContractModel = require('../../model/ContractModel');
const TokenStore = require('../../src/TokenStore');


const router = express.Router();


/* GET alts list. */
router.get('/:userId', cors(corsOptions), async (req, res) => {
  console.log('GET wallet');
  // Fetch contract for user
  try {
    const tok = await TokenStore.get('Character', req.params.userId);
    const contacts = await ContractModel.get(req.params.userId, tok);
    res.json({ info: contacts });
  } catch (error) {
    res.send({ error });
  }
});


module.exports = router;
