const express = require('express');
const cors = require('cors');
const corsOptions = require('../../Cors');
const mailRoute = require('./apiMail');
const charRoute = require('./apiCharacter');
const skillRoute = require('./apiSkill');


const router = express.Router();

/* GET alliances list. */
router.get('/', (req, res) => {
  // The main module returns a default Api instance with an attached
  // Api constructor if configuration changes are necessary.
  // Fetch all active alliance ids (could also call 'esi.alliances.all()')
  res.send('Invalid Api call');
});

router.use('/mail', cors(corsOptions), mailRoute);
router.use('/character', cors(corsOptions), charRoute);
router.use('/skill', cors(corsOptions), skillRoute);

module.exports = router;
