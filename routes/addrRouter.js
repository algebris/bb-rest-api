const _ = require('lodash');
const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.get('/:addr', async (req, res, next) => {
  const balance = await db.get(`addr:bal:${req.params.addr}`);
  if(balance === null) {
    res.json({err: 'Unknown address'});
  } else {
    res.json(balance);
  }
});

module.exports = router;