// require('@google-cloud/debug-agent').start();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const lessMiddleware = require('less-middleware');
const logger = require('morgan');
const cors = require('cors');
const Datastore = require('@google-cloud/datastore');
const corsOptions = require('./Cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const testEsiRouter = require('./routes/testEsi');
const apiRouter = require('./routes/api/api');
const scopesRouter = require('./routes/scopesRoute');
const loginRouter = require('./routes/loginRoute');
const oauthRouter = require('./routes/oauthCallback');
const mailRouter = require('./routes/mailRoute');
const SkillStatic = require('./model/SkillStatic');
const Store = require('./model/Store');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'Pnr:CkiUi^tE**K+Qgy&?x&g-Y@7..TG6XK2J4WHxzG3c:b4jpfUC]GFBk*f@8J_',
  cookie: { secure: false },
  resave: true,
  saveUninitialized: true,
}));
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use('/app', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

const datastore = new Datastore({
  projectId: 'ascee-recruit',
});

Store.connect(datastore);

app.use(cors());
app.use('/', cors(corsOptions), indexRouter);
app.use('/users', usersRouter);
app.use('/esi', testEsiRouter);
app.use('/api', cors(corsOptions), apiRouter);
app.use('/login', loginRouter);
app.use('/oauth-callback', oauthRouter);
app.use('/mail', mailRouter);
app.use('/scopes', scopesRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  console.log(req.path);
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.err = err;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

SkillStatic.loadFromDb();

module.exports = app;
