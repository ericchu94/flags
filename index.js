'use strict';
const fs = require('fs');

const Koa = require('koa');
const co = require('co');
const views = require('koa-views');
const Router = require('koa-router');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');
const auth = require('koa-basic-auth');

const app = new Koa();
const router = new Router();

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

try {
  const user = fs.readFileSync('user.json', {
    encoding: 'utf-8',
  });
  app.context.user = JSON.parse(user);
}
catch (err) {
  console.log(`Failed to load user: ${err}`);
  app.context.user = {
    name: 'admin',
    pass: 'admin',
  };
}

app.use(views(__dirname + '/views', {
  map: {
    ejs: 'ejs',
  },
  extension: 'ejs',
}));

app.use(co.wrap(function *(ctx, next) {
  try {
    yield next();
  }
  catch (err) {
    if (err.status == 401) {
      ctx.status = 401;
      ctx.set('WWW-Authenticate', 'Basic realm="Flags"');
    }
    else {
      throw err;
    }
  }
}));

router.get('/assets/*', serve('.'));

router.get('/', auth(app.context.user), co.wrap(function *(ctx) {
  yield ctx.render('index', {
    flags: app.context.flags,
  });
}));

router.get('/flags/:flag', co.wrap(function *(ctx) {
  const flag = app.context.flags[ctx.params.flag];

  if (!flag)
    return;

  ctx.body = flag.value ? 1 : 0;
}));

router.put('/flags/:flag', auth(app.context.user), co.wrap(save), co.wrap(function *(ctx) {
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

router.post('/flags/:flag', auth(app.context.user), bodyParser(), co.wrap(save), co.wrap(function *(ctx) {
  const flag = app.context.flags[ctx.params.flag];
  const value = ctx.request.body.value.toString().toLowerCase() === 'true';

  if (!flag)
    return;

  flag.value = value;
  ctx.status = 200;
}));

router.delete('/flags/:flag', auth(app.context.user), co.wrap(save), co.wrap(function *(ctx) {
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

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
