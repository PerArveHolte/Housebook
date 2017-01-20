var router = require('express').Router();
var fs = require('fs');

var config = require("../../../config");
var queue = require('./../../rabbitMQ');

/**
 * This API is set up for sending mails from our app
 * It requires params like:
 * @argument {String} from -recipient
 * @argument {String} subject email subject
 * @argument {String} content message html content
 */
router.post("/", function (req, res, next) {
    let template;
    const  email = req.body.replyTo;
    const content = req.body.content;

    switch (req.body.type) {
        case 'contact-form':
            console.log("Read html template");
            try {
                template = fs.readFileSync(__dirname + '/templates/contactform.mail.template.html', "utf8").toString();
                template = template.replace('${email}', email ? email : "Email not provided");
                template = template.replace('${content}',content);

                console.log(template);
            } catch (err) {
                console.error('err ' + err);
            }
            break;
        default:
            template = req.body.content;

    }

    const mailOptions = {
        to: req.body.to || config.mail_settings.contact_mail,
        from: config.mail_settings.contact_mail,
        subject: req.body.subject,
        html: template,
        replyTo: req.body.replyTo
    };

    queue.publishMsg(JSON.stringify(mailOptions));
    return res.sendStatus(200);
});

module.exports = router;