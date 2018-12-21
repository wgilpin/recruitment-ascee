const express = require('express');

const router = express.Router();
const users = require('../model/UserModel');

/* GET users listing. */
router.get('/', (req, res) => {
  users.create('mainId 2', 'alt name2', 'alt tok2', '/img/somewhere2');
  res.send('respond with a resource');
});

module.exports = router;
