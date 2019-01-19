const express = require('express');
const Character = require('../../model/CharacterModel');

const router = express.Router();

/* GET alts list. */
router.get('/', (req, res) => {
  res.send('no char specified');
});

router.get('/alts/:charId?', async (req, res) => {
  const main = req.params.charId ? req.params.charId : req.session.loggedInId;
  if (main) {
    // TODO: need access control here
    const alts = await Character.getAlts(main);
    res.json({ info: alts });
    return;
  }
  res.json({ error: 'login' });
});

router.get('/:charId', async (req, res) => {
  // check the cache
  const char = new Character();
  await char.get(req.params.charId);
  res.send(char.values);
});

module.exports = router;
