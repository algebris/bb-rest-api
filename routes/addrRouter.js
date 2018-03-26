const _ = require('lodash');
const express = require('express');
const router = express.Router();
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'api.addrRouter'});
const db = require('../utils/db');

const convertFromSatoshi = value => parseInt(value) / 100000000;

router.get('/balance/:addr', async (req, res, next) => {
  const data = await db.client.hmget(`addr:${req.params.addr}`, ['received', 'sent', 'balance']);
  if(data === null) {
    res.status(400).json({err: 'Unknown address'});
  } else {
    res.json({
      received: convertFromSatoshi(data[0]), 
      sent: convertFromSatoshi(data[1]),
      balance: convertFromSatoshi(data[2])
    });
  }
});

router.get('/listunspent/:addr', async (req, res, next) => {
  let data = await db.client.hgetall(`addr.utxo:${req.params.addr}`);
  
  if(data === null) {
    res.json({err: 'Unknown address'});
  } else {
    data = _.chain(data)
      .transform((acc, val, key) => {
        const [tx_hash, tx_pos] = key.split(':');
        try {
          val = JSON.parse(val)
        } catch(err) {
          return next(err);
        }
        acc.push({ 
          tx_hash, 
          tx_pos, 
          value: convertFromSatoshi(val.amount),
          height: val.height 
        });
      },[])
      .sortBy('height')
      .values();

    res.json(data);
  }
});

module.exports = router;