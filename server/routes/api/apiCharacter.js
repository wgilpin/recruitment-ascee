const express = require('express');
const Character = require('../../model/characterModel');

const router = express.Router();

/* GET alts list. */
router.get('/', (req, res) => {
  res.send('no char specified');
});

router.get('/:charId', async (req, res) => {
  console.log('GET char');

  // check the cache
  const char = await Character.get(req.params.charId);
  res.send(char.entityData);
});

module.exports = router;
