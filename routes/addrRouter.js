const _ = require('lodash');
const express = require('express');
const router = express.Router();
const bunyan = require('bunyan');
const cfg = require('../config');
const log = bunyan.createLogger({name: 'api.addrRouter'});
const db = require('../utils/db');
const BlockChain = require('../utils/blockchain');
const bc = new BlockChain(cfg.rpc);

const convertFromSatoshi = value => parseInt(value) / 100000000;
const RPC_HEADER = {api_status: "success", jsonrpc: "2.0"};
const wrapToJsonRPC = (data, test) =>  {
  const id = Date.now();
  const result = test ? {id, test, result: data} : {id, result: data};
  return _.assign({}, RPC_HEADER, result);
};

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
    if(req.user) {
      const balance = _.get(req.user, 'balance');
      const test = {
        equal: _.isEqual(balance, data.confirmed),
        balance: balance
      }
      delete req.user;
      res.json(wrapToJsonRPC(data, test));
    } else
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
    if(req.user) {
      const hashes = _.map(data, 'tx_hash');
      const diff = _.intersection(req.user.unspent, hashes);
      let test = {
        match: !(diff.length >0)
      };
      if(!test.match) _.assign(test, diff);
      delete req.user;
      res.json(wrapToJsonRPC(data, test));
    } else
      res.json(wrapToJsonRPC(data));
  }
});

router.get('/height', async (req, res, next) => {
  let hash = await db.getLatestBlock();
  hash = hash || {};
  
  res.json(hash);
});

router.get('/broadcast/:rawTx', async (req, res, next) => {
  const rawTx = req.params.rawTx;
  if(!rawTx) res.status(500).json({status:"error", msg:"Incorrect TX"});
  const result = await bc.sendRawTx(rawTx)
    .catch(err => res.status(500).json({status:"error", msg:err.message}));
  console.log(result);
  res.json({status:"success", "tx":result});
});

module.exports = router;