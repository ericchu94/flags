'use strict';
const Koa = require('koa');
const co = require('co');
const views = require('koa-views');

const app = new Koa();

app.use(views(__dirname + '/views', {
  map: {
    ejs: 'ejs',
  },
  extension: 'ejs',
}));

app.use(co.wrap(function *(ctx) {
  yield ctx.render('index');
}));

app.listen(3000);
