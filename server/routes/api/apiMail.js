const express = require('express');
const Mail = require('../../model/mailModel');
const User = require('../../model/userModel');


const router = express.Router();


/* GET alts list. */
router.get('/:userId', async (req, res) => {
  console.log('GET mail');
  // The main module returns a default Api instance with an attached
  // Api constructor if configuration changes are necessary.

  // Fetch all active alliance ids (could also call 'esi.alliances.all()')
  try {
    const user = await User.get(req.params.userId);
    const mails = Mail.getMailList(req.params.userId, user.token);
    res.render('mail', { mails });
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
