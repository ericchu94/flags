'use strict';
const {Sequelize, sequelize} = require('./sequelize');
const Flag = require('./flag');

const User = sequelize.define('user', {
  name: {
    type: Sequelize.STRING(40),
    unique: true,
  },
});

User.sync();

module.exports = User;
