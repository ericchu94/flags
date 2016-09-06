'use strict';
const Sequelize = require('sequelize');

const sequelize = new Sequelize('flagsd', null, null, {
  dialect: 'sqlite',
  storage: 'flags.sqlite',
});

exports.Sequelize = Sequelize;
exports.sequelize = sequelize;
