const cfg = require('./config');
const cluster = require('cluster');

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'api.index'});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next)=>{
  // console.log(req.method, req.path);
  next(null);
});
require('./routes')(app);

// Bind to a port
app.listen(cfg.port);
