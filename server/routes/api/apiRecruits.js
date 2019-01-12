const express = require('express');
const cors = require('cors');
const corsOptions = require('../../Cors');
const ApplicationModel = require('../../model/ApplicationModel');
const Logging = require('../../src/Logging');
const QandA = require('../../model/QandAModel');


const router = express.Router();

/* GET recruits list for signed in recruiter. */
router.get('/', cors(corsOptions), async (req, res) => {
  Logging.debug('GET recruits');
  try {
    if (req.session.loggedInId === undefined) {
      return res.json({ error: 'login' });
    }
    const applications = await ApplicationModel.getRecruitList(req.session.loggedInId);
    res.json({ info: applications });
  } catch (error) {
    res.send({ error });
  }
  return true;
});

const updateRecruit = async (newStatus, req, res) => {
  try {
    const recruit = new ApplicationModel();
    await recruit.get(req.params.recruitId);

    // allowable state transitions
    const allowedTransitions = {
      [ApplicationModel.statuses.unclaimed]: [ApplicationModel.statuses.claimed],
      [ApplicationModel.statuses.claimed]: [
        ApplicationModel.statuses.unclaimed,
        ApplicationModel.statuses.escalated,
      ],
      [ApplicationModel.statuses.escalated]: [ApplicationModel.statuses.claimed],
    };

    if (allowedTransitions[recruit.values.status].indexOf(newStatus) > -1) {
      recruit.update({ status: newStatus, recruiter: req.session.loggedInId });
      res.json({ info: recruit.values });
    } else {
      throw new Error(`Recruit ${req.params.recruitId} illegal transition to ${newStatus}`);
    }
  } catch (error) {
    throw new Error({ error });
  }
};

/* signed in recruiter wants to claim a recruit */
router.post('/claim/:recruitId', cors(corsOptions), async (req, res) => {
  Logging.debug('Claim recruit');
  updateRecruit(ApplicationModel.statuses.claimed, req, res);
});

/* signed in recruiter wants to escalate a recruit */
router.post('/escalate/:recruitId', cors(corsOptions), async (req, res) => {
  Logging.debug('Escalate recruit');
  updateRecruit(ApplicationModel.statuses.escalated, req, res);
});

/* signed in recruiter wants to abandon a case */
router.post('/abandon/:recruitId', cors(corsOptions), async (req, res) => {
  Logging.debug('Abandon recruit');
  updateRecruit(ApplicationModel.statuses.unclaimed, req, res);
});

/* senior recruiter wants to return escalated case to recruiter */
router.post('/deescalate/:recruitId', cors(corsOptions), async (req, res) => {
  Logging.debug('De-escalate recruit');
  updateRecruit(ApplicationModel.statuses.claimed, req, res);
});

router.post('/submit', cors(corsOptions), async (req, res) => {
  // start the users application
  if (req.session.loggedInId === undefined) {
    res.status(401);
    return res.json({ error: 'login' });
  }
  return QandA.updateQA(req.session.loggedInId, req.body.data.qa)
    .then(async () => {
      // submit application
      const appln = new ApplicationModel();
      try {
        await appln.get(req.session.loggedInId);
      } catch (err) {
        console.log('post get', err);
      }
      return appln.update({ mainId: req.session.loggedInId }).then(() => res.sendStatus(200));
    })
    .catch(err => console.log('post', err));
});

module.exports = router;
