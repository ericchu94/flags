'use strict';
const Koa = require('koa');
const co = require('co');
const views = require('koa-views');
const Router = require('koa-router');
const serve = require('koa-static');

const app = new Koa();
const router = new Router();

app.use(views(__dirname + '/views', {
  map: {
    ejs: 'ejs',
  },
  extension: 'ejs',
}));

router.get('/assets/*', serve('.'));

router.get('/', co.wrap(function *(ctx) {
  yield ctx.render('index', {
    flags: app.context.flags,
  });
}));

router.get('/manage/:flag', co.wrap(function *(ctx) {
  const flag = app.context.flags[ctx.params.flag];
  if (flag) {
    yield ctx.render('manage', {
      flag: app.context.flags[ctx.params.flag],
    });
  }
}));

app.context.flags = {
  flag1: {
    name: 'flag1',
    value: true,
  },
  flag2: {
    name: 'flag2',
    value: true,
  },
  flag3: {
    name: 'flag3',
    value: true,
  },
};

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
