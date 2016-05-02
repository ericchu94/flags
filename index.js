'use strict';
const Koa = require('koa');
const co = require('co');
const views = require('koa-views');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

app.use(views(__dirname + '/views', {
  map: {
    ejs: 'ejs',
  },
  extension: 'ejs',
}));

router.get('/', co.wrap(function *(ctx) {
  yield ctx.render('index', {
    flags: app.context.flags,
  });
}));

app.context.flags = [1, 2, 3];

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
