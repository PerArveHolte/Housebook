var router = require('express').Router();
var bcrypt = require('bcrypt');
var jwt = require('jwt-simple');
var config = require('../../config');

var User = require('../../model/user');

router.post('/', function (req, res, next) {
    User.findOne({username: req.body.username}).select('password').select('username')
            .exec(function (err, user) {
                if (err)
                    return next(err);
                if (!user)
                    return res.status(404).send("There is no user registered on this email account."); 

                bcrypt.compare(req.body.password, user.password, function (err, valid) {
                    if (err)
                        return next(err);

                    if (valid) {
                        var token = jwt.encode({username: user.username}, config.secret);
                        return res.send(token);
                    } else {
                        return res.status(401).send("The user name and password doesn't match.");  
                    }

                });
            });
});

module.exports = router;