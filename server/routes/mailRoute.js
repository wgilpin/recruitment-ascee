const express = require('express');
const Mail = require('../model/mailModel');
const User = require('../model/userModel');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  // The main module returns a default Api instance with an attached
  // Api constructor if configuration changes are necessary.

  // Fetch all active alliance ids (could also call 'esi.alliances.all()')
  console.log(`get mail for ${req.session.CharacterId}`);
  User.get(req.session.CharacterId).then((user) => {
    const mails = Mail.getMailList(user.id, user.token);
    res.render('mail', { mails });
  });
});

module.exports = router;
