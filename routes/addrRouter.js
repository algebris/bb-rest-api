const _ = require('lodash');
const express = require('express');
const router = express.Router();
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'api.addrRouter'});
const db = require('../utils/db');

const convertFromSatoshi = value => parseInt(value) / 100000000;
const RPC_HEADER = {api_status: "success", jsonrpc: "2.0"};
const wrapToJsonRPC = result =>  _.assign(RPC_HEADER, {id: Date.now(), result});

router.get('/balance/:addr', async (req, res, next) => {
  let data = await db.client.hmget(`addr:${req.params.addr}`, ['sent', 'received', 'staked', 'balance',]);
  data = _.compact(data);

  if(_.isEmpty(data)) {
    res.status(400).json({err: 'Unknown address'});
  } else {
    data = _.map(data, _.parseInt);
    data = {
      confirmed: data[3],
      sent: data[0],
      received: data[1], 
      staked: data[2]
    };
    res.json(wrapToJsonRPC(data));
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
    res.json(wrapToJsonRPC(data));
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