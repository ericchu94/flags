'use strict';
const Sequelize = require('sequelize');

const sequelize = new Sequelize('flags', 'flags', 'flags', {
  dialect: 'mysql',
  dialectOptions: {
    socketPath: '/var/run/mysqld/mysqld.sock',
  },
});

exports.Sequelize = Sequelize;
exports.sequelize = sequelize;
