const express = require('express');

const router = express.Router();
const users = require('../model/userModel');

/* GET users listing. */
router.get('/', (req, res) => {
  console.log('users', users);
  users.create('mainId 2', 'alt name2', 'alt tok2', '/img/somewhere2');
  res.send('respond with a resource');
});

module.exports = router;
