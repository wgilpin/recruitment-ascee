const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/:name?', (req, res) => {
  res.render('scopes', { name: req.session.name });
});

module.exports = router;
