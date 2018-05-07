const _ = require('lodash');
const qs = require('querystring');
const express = require('express');
const router = express.Router();
const axios = require('axios');

const convertToSatoshi = val => parseInt(parseFloat(val).toFixed(8).toString().replace('.', ''));
const getChainzQuery = (method, addr) => {
  const KEY = '279a7ad64ed0';
  let str = `https://chainz.cryptoid.info/bay/api.dws?a=${addr}&q=${method}&key=${KEY}`;
  if(method == 'unsent')
    str = `https://chainz.cryptoid.info/bay/api.dws?active=${addr}&q=unspent&key=${KEY}`
  return axios.get(str);
}

router.get('/balance/:addr', async (req, res, next) => {
  const creq = await getChainzQuery('getbalance', req.params.addr);
  if(creq.status == 200) {
    if(!req.user) req.user = {};
    req.user = _.assign(req.user, { balance: convertToSatoshi(creq.data) });
  }
  next(null);
});

router.get('/listunspent/:addr', async (req, res, next) => {
  const creq = await getChainzQuery('unspent', req.params.addr);
  if(creq.status == 200) {
    if(!req.user) req.user = {};
    let unspent = _.get(creq.data, 'unspent_outputs', []);
    unspent = _.map(unspent, 'tx_hash');
    req.user = _.assign(req.user, { unspent });
  }
  next(null);  
});

module.exports = router;