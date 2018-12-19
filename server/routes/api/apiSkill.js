const express = require('express');
const cors = require('cors');
const corsOptions = require('../../Cors');
const SkillsModel = require('../../model/SkillsModel');

const router = express.Router();

/* GET user skills. */
router.get('/:userId', cors(corsOptions), async (req, res) => {
  console.time('GET user skills');
  // Fetch all skills for user
  try {
    const skillInstance = new SkillsModel();
    const skills = await skillInstance.get(req.params.userId);
    res.json({ info: skills });
  } catch (error) {
    res.json({ err: error });
  }
  console.timeEnd('GET user skills');
});

module.exports = router;
