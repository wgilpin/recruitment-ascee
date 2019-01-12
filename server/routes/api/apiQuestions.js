const express = require('express');
const cors = require('cors');
const corsOptions = require('../../Cors');
const logging = require('../../src/Logging');
const QandA = require('../../model/QandAModel');
const ApplicationModel = require('../../model/ApplicationModel');


const router = express.Router();

/* GET questions list. */
router.get('/', cors(corsOptions), async (req, res) => {
  logging.debug('GET questions');
  return QandA.getQuestions(req.session.loggedInId)
    .then((info) => {
      res.json({ info });
    }).catch((error) => {
      res.send({ error });
    });
});


router.post('/save', cors(corsOptions), async (req, res) => {
  // save the users questions
  QandA.updateQA(req.body).then(() => res.send(200));
});

router.post(
  '/submit',
  cors(corsOptions),
  async (req, res) => (
  // start the users application
    QandA.updateQA(req.body).then(() => {
    // submit application
      const appln = new ApplicationModel();
      return appln.update(req.body).then(res.send(200));
    })
  ),
);

module.exports = router;
