const express = require('express');
const Character = require('../../model/CharacterModel');

const router = express.Router();

/* GET alts list. */
router.get('/', (req, res) => {
  res.send('no char specified');
});

router.get('/:charId', async (req, res) => {
  // check the cache
  const char = new Character();
  await char.get(req.params.charId);
  res.send(char.values);
});

module.exports = router;
