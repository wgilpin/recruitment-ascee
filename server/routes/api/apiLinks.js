// for mail links of form showinfo:1234//96891007
// the first number is the type, second the Id

const express = require('express');
const Character = require('../../model/CharacterModel');
const Types = require('../../model/TypesModel');

const router = express.Router();


router.get('/:userId/:list', async (req, res) => {
  const { list } = req.params;
  const links = JSON.parse(list);
  const out = links.map(async ({ typeId, itemId }) => {
    const typeInfo = await new Types().get(typeId);
    if (typeInfo) {
      if (typeInfo.name.startsWith('Character')) {
        const char = new Character();
        const info = await char.get(itemId);
        console.log(`apiLinks info ${info}`);
        return ({
          type: 'character',
          data: info,
          typeId,
          itemId,
        });
      }
    }
    return res.json({ error: 'unknown' });
  });
  return Promise.all(out).then(info => res.json({ info }));
});

module.exports = router;
