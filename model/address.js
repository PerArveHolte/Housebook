var db = require('../db');

var address = db.Schema({
    street1: {type: String, required: false},
    street2: {type: String, required: false},
    postalCode: {type: String, required: false},
    city: {type: String, required: false},
    country: {type: String, required: false}
    
/* 2017-02-05 Guri commented out "state" for now.
    ,
    state: {type: String, required: false}
    */
});

module.exports = db.model('Address', address);