'use strict';
const fs = require('fs');

const Koa = require('koa');
const co = require('co');
const views = require('koa-views');
const Router = require('koa-router');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');

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

router.put('/flag/:flag', co.wrap(save), co.wrap(function *(ctx) {
  const flags = app.context.flags;
  const name = ctx.params.flag;

  if (!name)
    return;

  if (name in flags)
    return;

  flags[name] = {
    name: name,
    value: false,
  };
  ctx.status = 200;
}));

router.post('/flag/:flag', bodyParser(), co.wrap(save), co.wrap(function *(ctx) {
  const flag = app.context.flags[ctx.params.flag];
  const value = ctx.request.body.value.toString().toLowerCase() === 'true';

  if (!flag)
    return;

  flag.value = value;
  ctx.status = 200;
}));

router.delete('/flag/:flag', co.wrap(save), co.wrap(function *(ctx) {
  const flags = app.context.flags;
  const name = ctx.params.flag;

  if (!(name in flags))
    return;

  delete flags[name];
  ctx.status = 200;
}));

function *save(ctx, next) {
  yield next();
  const flags = JSON.stringify(app.context.flags);
  fs.writeFile('flags.json', flags);
}

try {
  const flags = fs.readFileSync('flags.json', {
    encoding: 'utf-8',
  });
  app.context.flags = JSON.parse(flags);
}
catch (err) {
  console.log(`Failed to load flags: ${err}`);
  app.context.flags = {};
}

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
