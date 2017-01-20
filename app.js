var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var usersAPI = require('./controllers/api/user/user');
var userPasswordAPI = require('./controllers/api/user/password');
var sessionAPI = require('./controllers/api/sessions');
var houseAPI = require('./controllers/api/house');
var mailerAPI = require('./controllers/api/mailer/mailer');
var awsAPI = require('./controllers/api/aws');

var app = express();

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
if (process.env.ENV_TYPE !== 'development') {
    app.use(logger('common', {skip: function (req, res) {
            return res.statusCode < 400;
        }}));
} else {
    console.log("Use logger");
    app.use(logger('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(cookieParser());
//app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/img', express.static(path.join(__dirname, 'uploads')));

app.use(require('./auth'));
app.use('/session', sessionAPI);
app.use('/users', usersAPI);
app.use('/users/password', userPasswordAPI);
app.use('/house', houseAPI);
app.use('/mail', mailerAPI);
app.use('/aws', awsAPI);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
//    res.render('error');
});

module.exports = app;
