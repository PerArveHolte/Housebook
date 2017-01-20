var amqp_url = process.env.CLOUDAMQP_URL;// || "amqp://localhost";
var open_amqp = require('amqplib').connect(amqp_url);

var queueObj = {};
queueObj.consumerChnl = null;
queueObj.publisherChnl = null;

queueObj.createConsumerChnl = function (cb) {
    // Creates an AMPQ channel for consuming messages on 'my-worker-q'
    console.log("RabbitMQ receiver: create consumer channel");
    open_amqp
            .then(function (conn) {
                conn.createChannel()
                        .then(function (ch) {
                            ch.assertQueue('my-worker-q');
                            queueObj.consumerChnl = ch;
                            queueObj.startConsuming(cb);
                        });
            });
};

queueObj.createPublisherChannel = function () {
    console.log("Create rabbitMQ");
    // Create an AMPQ "connection"
    open_amqp
            .then(function (conn) {
                // You need to create at least one AMPQ "channel" on your connection   
                console.log("RabbitMQ connection open");
                var ok = conn.createChannel();
                ok = ok.then(function (ch) {
                    console.log("RabbitMQ channel created");
                    queueObj.publisherChnl = ch;
                    // Now create a queue for the actual messages to be sent to the worker dyno 
                    queueObj.publisherChnl.assertQueue('my-worker-q');
                    queueObj.publishMsg();
                });
            });
};

queueObj.startConsuming = function (cb) {
    console.log("RabbitMQ receiver: listing for messages");
    queueObj.consumerChnl.consume('my-worker-q', function (msg) {
        if (msg !== null) {
            // Tell RabbitMQ server we have consumed the message
            cb(msg);
            queueObj.consumerChnl.ack(msg);
        }
    });
};

queueObj.publishMsg = function (msgObj) {
    // Send the worker a message
    if (msgObj){
        console.log("Message sent to queue");
        queueObj.publisherChnl.sendToQueue('my-worker-q', new Buffer(msgObj, "utf-8"));
    }
        
};


module.exports = queueObj;