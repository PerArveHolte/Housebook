var db = require('../db');

var address = db.Schema({
    street1: {type: String, required: false},
    street2: {type: String, required: false},
    postalCode: {type: String, required: false},
    city: {type: String, required: false},
    country: {type: String, required: false},
    state: {type: String, required: false}
});

module.exports = db.model('Address', address);