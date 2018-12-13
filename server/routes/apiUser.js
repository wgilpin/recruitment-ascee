const express = require('express');

const router = express.Router();

const esi = require('eve-swagger');

/* GET alts list. */
router.get('/alliances', (req, res) => {
  console.log('GET alliances');
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
});

module.exports = router;
