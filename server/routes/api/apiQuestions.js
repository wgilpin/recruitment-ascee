const express = require('express');
const cors = require('cors');
const corsOptions = require('../../Cors');
const logging = require('../../src/Logging');


const router = express.Router();

/* GET questions list. */
router.get('/', cors(corsOptions), async (req, res) => {
  logging.debug('GET questions');
  // Fetch all mail for user
  try {
    const qs = [
      {
        q: 'How long have you been playing Eve?',
        a: '3 years',
      },
      {
        q: 'PVP or PVE? Why?',
        a: '',
      },
    ];
    res.json({ info: qs });
  } catch (error) {
    res.send({ error });
  }
});

module.exports = router;
