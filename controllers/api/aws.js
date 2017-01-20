var router = require('express').Router();
var aws = require('aws-sdk');

//aws.config.region = 'us-west-2';
aws.config.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
aws.config.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;


router.get('/sign-s3', function (req, res) {

    var s3 = new aws.S3();
    var fileName = req.query.profileId + '/' + req.query.fileName;
    var fileType = req.query.fileType;

    var s3Params = {
        Key: fileName,
        Bucket: process.env.S3_BUCKET_NAME,
        Expires: 600,
        ContentType: fileType,
        ACL: 'public-read'
    };
    
    s3.getSignedUrl('putObject', s3Params, function (err, data) {
        if (err) {
            console.log(err);
            return res.end();
        }
        var returnData = {
            signedRequest: data,
            url: 'https://${S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}',
            headers: {'Content-Type': undefined}
        };
        res.write(JSON.stringify(returnData));
        res.end();
    });
});

module.exports = router;
