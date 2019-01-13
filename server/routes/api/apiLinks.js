// for mail links of form showinfo:1234//96891007
// the first number is the type, second the Id

const express = require('express');
const Character = require('../../model/CharacterModel');
const Types = require('../../model/TypesModel');

const router = express.Router();


router.get('/:typeId/:otherId', async (req, res) => {
  const { typeId, otherId } = req.params;
  if (typeId) {
    const typeInfo = await Types.get(typeId);
    if (typeInfo) {
      if (typeInfo.values.name.startsWith('Character')) {
        const char = new Character();
        await char.get(otherId);
        return res.json({ info: char.values.name });
      }
    }
    return res.json({ error: 'unknown' });
  }
  res.json({ error: 'params' });
});

module.exports = router;
