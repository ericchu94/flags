'use strict';
const fs = require('fs');

const Koa = require('koa');
const views = require('koa-views');
const Router = require('koa-router');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session')
const convert = require('koa-convert');
const IO = require('koa-socket');

const Flag = require('./flag');
const User = require('./user');

const PORT = process.env.PORT || 3000;

const app = new Koa();
const io = new IO();
const router = new Router();

function createFlag(userName, flagName) {
  return User.findOrCreate({
    where: {
      name: userName,
    },
  }).spread((user, created) => {
    // findOrCreate used for pseudo unique constraint
    return Flag.findOrCreate({
      where: {
        name: flagName,
        userId: user.id,
      },
    });
  });
}

function getUserId(userName) {
  return User.findOne({
    where: {
      name: userName,
    },
  }).then(user => {
    if (user == null)
      throw new Error('Not found');
    return user.id;
  });
}

function deleteFlag(userName, flagName) {
  return getUserId(userName).then(id => {
    return Flag.destroy({
      where: {
        name: flagName,
        userId: id,
      },
    });
  });
}

function getFlags(userName) {
  return getUserId(userName).then(id => {
    return Flag.findAll({
      where: {
        userId: id,
      },
    });
  }, err => {
    return [];
  });
}

function getFlag(userName, flagName) {
  return getUserId(userName).then(id => {
    return Flag.findOne({
      where: {
        name: flagName,
        userId: id,
      },
    });
  });
}

function setFlag(userName, flagName, enabled) {
  return getUserId(userName).then(id => {
    return Flag.update({
      enabled: enabled,
    }, {
      where: {
        name: flagName,
        userId: id,
      },
    });
  });
}

io.attach(app);

io.on('createFlag', (ctx, data) => {
  ctx.socket.socket.join(data.userName);
  createFlag(data.userName, data.flagName).spread((flag, created) => {
    if (created) {
      io.socket.to(data.userName).emit('createFlag', {
        user: data.userName,
        flag: flag,
      });
    }
  });
});

io.on('getFlag', (ctx, data) => {
  ctx.socket.socket.join(data.userName);
  getFlag(data.userName, data.flagName).then(flag => {
    ctx.socket.emit('getFlag', {
      user: data.userName,
      flag: flag,
    });
  });
});

io.on('getFlags', (ctx, data) => {
  ctx.socket.socket.join(data.userName);
  getFlags(data.userName).then(flags => {
    ctx.socket.emit('getFlags', {
      user: data.userName,
      flags: flags,
    });
  });
});

io.on('setFlag', (ctx, data) => {
  ctx.socket.socket.join(data.userName);
  setFlag(data.userName, data.flagName, data.enabled).then(() => {
    io.socket.to(data.userName).emit('setFlag', {
      user: data.userName,
      flag: {
        name: data.flagName,
        enabled: data.enabled,
      },
    });
  });
});

io.on('deleteFlag', (ctx, data) => {
  ctx.socket.socket.join(data.userName);
  deleteFlag(data.userName, data.flagName).then(() => {
    io.socket.to(data.userName).emit('deleteFlag', {
      user: data.userName,
      flag: {
        name: data.flagName,
      },
    });
  });
});

app.use((ctx, next) => {
  const start = new Date();
  return next().then(() => {
    const end = new Date();
    console.log(`${ctx.method} ${ctx.url} - ${end - start} ms`);
  });
});

app.use(views(__dirname + '/views', {
  map: {
    ejs: 'ejs',
  },
  extension: 'ejs',
}));

app.use(convert(session(app)));

router.get('/assets/*', serve('.'));

router.get('/:user', ctx => {
  return getFlags(ctx.params.user).then(flags => {
    return ctx.render('index', {
      flags: flags,
    });
  });
});

router.get('/flags/:user', ctx => {
  return getFlags(ctx.params.user).then(flags => {
    ctx.body = flags;
  });
});

router.get('/flags/:user/:flag', ctx => {
  return getFlag(ctx.params.user, ctx.params.flag).then(flag => {
    ctx.body = flag.enabled ? 1 : 0;
  });
});

router.put('/flags/:user/:flag', ctx => {
  return createFlag(ctx.params.user, ctx.params.flag).then(() => {
    ctx.status = 200;
    console.log(`Create ${ctx.params.flag}`);
  });
});

router.post('/flags/:user/:flag', bodyParser(), ctx => {
  const enabled = ctx.request.body.value.toString().toLowerCase() === 'true';
  return setFlag(ctx.params.user, ctx.params.flag, enabled).then(() => {
    ctx.status = 200;
  });
});

router.delete('/flags/:user/:flag', ctx => {
  return deleteFlag(ctx.params.user, ctx.params.flag).then(() => {
    ctx.status = 200;
    console.log(`Delete ${ctx.params.flag}`);
  });
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Listen on port ${PORT}`);
});
