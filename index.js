'use strict';
const Koa = require('koa');
const co = require('co');

const app = new Koa();

app.use(ctx => {
  ctx.body = 'Hi';
});

app.listen(3000);
