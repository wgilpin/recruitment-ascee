const express = require('express');
const cors = require('cors');
const corsOptions = require('../../Cors');
const Recruits = require('../../model/RecruitModel');
const Logging = require('../../src/Logging');

const router = express.Router();

/* GET recruits list for signed in recruiter. */
router.get('/', cors(corsOptions), async (req, res) => {
  Logging.debug('GET recruits');
  try {
    const recruits = await Recruits.getRecruitList(req.session.userId);
    res.json({ info: recruits });
  } catch (error) {
    res.send({ error });
  }
});

const updateRecruit = async (newStatus, req, res) => {
  try {
    const recruit = new Recruits();
    await recruit.get(req.params.recruitId);

    // allowable state transitions
    const allowedTransitions = {
      [Recruits.statuses.unclaimed]: [Recruits.statuses.claimed],
      [Recruits.statuses.claimed]: [Recruits.statuses.unclaimed, Recruits.statuses.escalated],
      [Recruits.statuses.escalated]: [Recruits.statuses.unclaimed],
    };

    if (newStatus in allowedTransitions[recruit.status]) {
      recruit.update({ status: newStatus, recruiter: req.session.userId });
      res.json({ info: recruit.values });
    } else {
      res.error(`Recruit ${req.params.recruitId} illegal transition to ${newStatus}`);
    }
  } catch (error) {
    res.send({ error });
  }
};

/* signed in recruiter wants to claim a recruit */
router.get('/claim/:recruitId', cors(corsOptions), async (req, res) => {
  Logging.debug('Claim recruit');
  updateRecruit(Recruits.statuses.claimed, req, res);
});

/* signed in recruiter wants to escalate a recruit */
router.get('/claim/:recruitId', cors(corsOptions), async (req, res) => {
  Logging.debug('Escalate recruit');
  updateRecruit(Recruits.statuses.escalated, req, res);
});

/* signed in recruiter wants to abandon a case */
router.get('/abandon/:recruitId', cors(corsOptions), async (req, res) => {
  Logging.debug('Abandon recruit');
  updateRecruit(Recruits.statuses.unclaimed, req, res);
});

/* senior recruiter wants to return escalated case to recruiter */
router.get('/deescalate/:recruitId', cors(corsOptions), async (req, res) => {
  Logging.debug('De-escalate recruit');
  updateRecruit(Recruits.statuses.claimed, req, res);
});

module.exports = router;
