const _ = require('lodash');
const express = require('express');
const router = express.Router();
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'api.addrRouter'});
const db = require('../utils/db');

const convertFromSatoshi = value => parseInt(value) / 100000000;

router.get('/balance/:addr', async (req, res, next) => {
  const data = await db.client.hmget(`addr:${req.params.addr}`, ['sent', 'received', 'staked', 'balance',]);
  if(data === null) {
    res.status(400).json({err: 'Unknown address'});
  } else {
    res.json({
      sent: convertFromSatoshi(data[0]),
      received: convertFromSatoshi(data[1]), 
      staked: convertFromSatoshi(data[2]),
      balance: convertFromSatoshi(data[3])
    });
  }
});

router.get('/listunspent/:addr', async (req, res, next) => {
  let data = await db.client.lrange(`addr.utxo:${req.params.addr}`, 0, -1);
  
  if(data === null) {
    res.json({err: 'Unknown address'});
  } else {
    res.json(data);
  }
});

module.exports = router;