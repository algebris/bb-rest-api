const requireAll = require('require-all');
const cfg = require('../config');
const testInterceptor = require('../utils/testInterceptor');

let routes = requireAll({
  dirname: __dirname,
  recursive: true,
  filter: /^(.+)Router\.js$/
});

module.exports = app => {
  app.get(`/`, (req, res) => res.json({status: 0, message: 'BB API alive!'}));
  app.use(cfg.apiPrefix + '/', routes.addr);
  app.use(`${cfg.apiPrefix}_/`, testInterceptor, routes.addr);
};