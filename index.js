const cluster = require('cluster');
const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'api.index'});

if (cluster.isMaster) {
  const cpuCount = require('os').cpus().length;

  for (var i = 0; i < cpuCount; i += 1) {
      cluster.fork();
  }
  cluster.on('exit', function (worker) {
      log.info('Worker %d died :(', worker.id);
      cluster.fork();
  });
} else {
  require('./app');
}