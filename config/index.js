require('dotenv').config();

module.exports = {
  port: process.env.SERVER_PORT || '3333',
  apiPrefix: '/api'
};