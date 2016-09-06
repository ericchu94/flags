'use strict';
const {Sequelize, sequelize} = require('./sequelize');
const User = require('./user');

const Flag = sequelize.define('flag', {
  name: Sequelize.STRING,
  enabled: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
});

User.hasMany(Flag, {as: 'Flags'});

Flag.sync();

module.exports = Flag;
