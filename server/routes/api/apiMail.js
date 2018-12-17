const express = require('express');
const Mail = require('../../model/mailModel');
const User = require('../../model/UserModel');


const router = express.Router();


/* GET alts list. */
router.get('/:userId', async (req, res) => {
  console.log('GET mail');
  // The main module returns a default Api instance with an attached
  // Api constructor if configuration changes are necessary.

  // Fetch all active alliance ids (could also call 'esi.alliances.all()')
  try {
    const user = new User();
    await user.get(req.params.userId);
    const mails = await Mail.getMailList(req.params.userId, user.values.scopeToken);
    res.send(mails);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
