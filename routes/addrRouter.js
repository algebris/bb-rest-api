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
  let data = await db.client.sort(`addr.utxo:${req.params.addr} BY utxo:*->time GET utxo:*->json`.split(' '));
  try {
    data = _.map(data,  JSON.parse);
  } catch(err) {
    log.error(err);
    data = null;
  }
  
  if(data === null) {
    res.json({err: 'Unknown address'});
  } else {
    const mapKeys = {
      'txid':'tx_hash',
      'n':'tx_pos',
      'val':'value',
      'height':'height'
    };
    const makeObj = obj => _.chain(obj)
      .pick(['txid', 'n', 'val', 'height'])
      .mapKeys((v, k) => mapKeys[k])
      .value();

    data = _.map(data, makeObj);
    res.json(data);
  }
});

router.get('/height', async (req, res, next) => {
  let hash = await db.client.zrange('block-chain', -1, -1);
  hash = hash.shift() || 0;
  
  const height = hash ?
    await db.client.zrank('block-chain', hash) : 0;
    
  res.json({height, hash});
});

module.exports = router;