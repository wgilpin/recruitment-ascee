const express = require('express');
const cors = require('cors');
const corsOptions = require('../../Cors');
const CalendarModel = require('../../model/CalendarModel');
const TokenStore = require('../../src/TokenStore');


const router = express.Router();


/* GET events list. */
router.get('/:userId', cors(corsOptions), async (req, res) => {
  console.log('GET calendar');
  // Fetch events for user
  try {
    const tok = await TokenStore.get('Character', req.params.userId);
    const cal = await CalendarModel.get(req.params.userId, tok);
    res.json({ info: cal });
  } catch (error) {
    res.send({ error });
  }
});

/* GET event detail. */
router.get('/:userId/:eventId', cors(corsOptions), async (req, res) => {
  console.log('GET calendar event');
  // Fetch wallet for user
  try {
    const tok = await TokenStore.get('Character', req.params.userId);
    const info = await CalendarModel.getEvent(req.params.userId, req.params.eventId, tok);
    res.json({ info });
  } catch (error) {
    res.send({ error });
  }
});


module.exports = router;
