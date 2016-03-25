var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var db = mongoose.connect("mongodb://localhost:27017/person");
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var routes = require('./routes/index');
var users = require('./routes/users');
var articles = require('./routes/articles');
var flash = require('connect-flash');

var app = express();

app.use(session({
    secret: 'eric',
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//设定 cookie 的生存期，这里我们设置 cookie 的生存期为 30 天
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ //设置它的 store 参数为 MongoStore 实例，把会话信息存储到数据库中，以避免重启服务器时会话丢失
        mongooseConnection: mongoose.connection
    })
}))
app.use(flash());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//配置模板的中间件
app.use(function (req, res, next) {
    //res.locals才是真正的渲染模板的对象
    res.locals.user = req.session.user;
    //flash取出来的是一个数组
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next();
});


app.use('/', routes);
app.use('/users', users);
app.use('/articles', articles);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
