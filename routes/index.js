const requireAll = require('require-all');
const cfg = require('../config');

let routes = requireAll({
  dirname: __dirname,
  recursive: true,
  filter: /^(.+)Router\.js$/
});

module.exports = app => {
  app.get(`/`, (req, res) => res.json({status: 0, message: 'BB API alive!'}));
  app.use(cfg.apiPrefix + '/addr', routes.addr);
};