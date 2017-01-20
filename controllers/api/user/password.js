var router = require('express').Router();
var bcrypt = require('bcrypt');
var jwt = require('jwt-simple');
var crypto = require('crypto');
var config = require('../../../config');
var queue = require('./../../rabbitMQ');

var User = require('../../../model/user');

//create reset password link (if we have user with given mail) and send it to user mail
router.get('/reset/:email', function (req, res, next) {
    if (!req.params.email) {
        return res.status(400).send("User email is missing");
    }
    console.log(req.params.email);
    User.findOne({email: req.params.email}, function (err, user) {
        if (err)
            return next(err);

        if (!user) {
            return res.status(404).send("Couldn't find user with given email");
        }
        crypto.randomBytes(24, function (err, buffer) {
            user.resetPasswordHash = buffer.toString('hex');

            user.save(function (err) {
                if (err)
                    return next(err);

                else {
                    var htmlContent = "Hi,<br><p>You have requested your password to be reset. Just click the link below, and you will be redirected to <strong>Housebook</strong>, and may then change your password.</p>"
                            .concat("<br>Please go to <a href='//")
                            .concat(process.env.ENV_HOST)
                            .concat("/#/user/change-password/")
                            .concat(user.resetPasswordHash)
                            .concat("'>reset password link</a>")
                            .concat("<br><br><p>If you have not requested to change your password, simply ignore this email.</p>")
                            .concat("<br>Cheers,")
                            .concat("<h3>Housebook Team</h3>");

                    var mailOptions = {
                        to: req.params.email,
                        from: config.mail_settings.contact_mail,
                        subject: "Housebook - reset password",
                        html: htmlContent,
                        replyTo: req.body.replyTo
                    };
                    queue.publishMsg(JSON.stringify(mailOptions));
                    return res.status(200).send(user.resetPasswordHash);
                }

            });
        });
    });
});

router.get('/reset/validate/:token', function (req, res) {
    if (!req.params.token) {
        return res.status(400).send("Reset password token is missing");
    }

    User.findOne({resetPasswordHash: req.params.token}, function (err, user) {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (!user) {
            return res.status(498).send("Invalid reset password link");
        }

        if (user.resetPasswordExpire) {
            var timeDiff = Math.abs(new Date().getTime() - new Date(user.resetPasswordExpire).getTime());
            var diffHours = Math.ceil(timeDiff / (1000 * 3600));

            if (diffHours > 24) {
                return res.status(498).send("Invalid reset password link");
            }
        }


        return res.status(200).send(user.username);
    });
});

router.put('/change', function (req, res) {
    if (!req.body.isPasswordReset && !req.auth) {
        return res.sendStatus(401);
    }
    var username = req.body.username || req.auth.username;
    if (username) {
        User.findOne({username: username}, function (err, user) {
            bcrypt.hash(req.body.password, 10, function (err, hash) {
                user.password = hash;
                user.resetPasswordHash = undefined;
                user.resetPasswordExpire = undefined;
                user.save(function (err) {
                    if (err)
                        return res.status(500).send("Couldn't set new password.");

                    var token = jwt.encode({username: user.username}, config.secret);
                    return res.send(token);
                });
            });
        });
    }

});

module.exports = router;