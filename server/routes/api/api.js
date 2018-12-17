const express = require('express');
const mailRoute = require('./apiMail');
const charRoute = require('./apiCharacter');

const router = express.Router();

/* GET alliances list. */
router.get('/', (req, res) => {
  // The main module returns a default Api instance with an attached
  // Api constructor if configuration changes are necessary.
  // Fetch all active alliance ids (could also call 'esi.alliances.all()')
  res.send('Invalid Api call');
});

router.use('/mail', mailRoute);
router.use('/character', charRoute);

module.exports = router;
