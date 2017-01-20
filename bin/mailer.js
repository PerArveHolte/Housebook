var queue = require('../controllers/rabbitMQ');
var config = require("../config");
var nodemailer = require('nodemailer');

queue.createConsumerChnl(sendMail);

function sendMail(mailOptionsBuf) {
    console.log("Enter send mail callback");
    var mailOptions = JSON.parse(mailOptionsBuf.content);

    if (!mailOptions.subject) {
        console.log("Mail option is not correct, break");
        return;
    }

    console.log("Prepare mail transport options");
    var transportOptions = {
        pool: true,
        host: config.mail_settings.smpt_server,
        port: config.mail_settings.port,
        secure: true, // use SSL
        auth: {
            user: config.mail_settings.username,
            pass: config.mail_settings.password
        },
        debug: true,
        logger: true
    };

    var transporter = nodemailer.createTransport(transportOptions);

    console.log("Send mail");
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log("Mail send err: " + err);
        }

        console.log('Message sent: ' + info.response);
    });
}
   