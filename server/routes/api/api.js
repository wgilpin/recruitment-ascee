const express = require('express');
const cors = require('cors');
const corsOptions = require('../../Cors');
const mailRoute = require('./apiMail');
const charRoute = require('./apiCharacter');
const skillRoute = require('./apiSkill');
const walletRoute = require('./apiWallet');
const assetRoute = require('./apiAssets');
const recruitsRoute = require('./apiRecruits');
const questionsRoute = require('./apiQuestions');
const linksRoute = require('./apiLinks');
const contactsRoute = require('./apiContacts');
const contractRoute = require('./apiContract');
const bookmarksRoute = require('./apiBookmarks');
const calendarRoute = require('./apiCalendar');
const marketRoute = require('./apiMarket');


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
router.use('/wallet', cors(corsOptions), walletRoute);
router.use('/assets', cors(corsOptions), assetRoute);
router.use('/recruits', cors(corsOptions), recruitsRoute);
router.use('/questions', cors(corsOptions), questionsRoute);
router.use('/link', cors(corsOptions), linksRoute);
router.use('/contacts', cors(corsOptions), contactsRoute);
router.use('/contract', cors(corsOptions), contractRoute);
router.use('/bookmarks', cors(corsOptions), bookmarksRoute);
router.use('/calendar', cors(corsOptions), calendarRoute);
router.use('/market', cors(corsOptions), marketRoute);

module.exports = router;
