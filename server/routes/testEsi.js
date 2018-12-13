const esi = require('eve-swagger');
const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  // The main module returns a default Api instance with an attached
  // Api constructor if configuration changes are necessary.

  // Fetch all active alliance ids (could also call 'esi.alliances.all()')
  esi
    .alliances()
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.send(error);
    });
  // res.send('Done');
});

module.exports = router;
