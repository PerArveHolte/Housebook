var db = require('../db');

var user = db.Schema({

/* 2017-02-06 Guri: To be fixed later: use email instead of username as identifier */
    username: {type: String, select: true, unique: true},

    firstName: {type: String, select: true},
    lastName: {type: String, select: true},
    email: {type: String, select: true, unique: true},
    password: {type: String, select: false},
    needToChangePassword: {type: Boolean, select: false},
    resetPasswordHash: {type: String, select: false},

/* 2017-02-06 Guri: To be fixed later: removing the expire option on the password */
    resetPasswordExpire: {type: Date, default: addDaysToDefaultDate(1)},
    expire: {type: Date, default: addDaysToDefaultDate(90)},

    auth: {type: String, select: false},
    roles: {type: Array, select: true},

/* 2017-02-12 Guri: To be fixed later: In place of keeping a list of created house profiles, 
 * there should be implemented a database-table "house-user-role" table, ref architecture discussion. */
    createdHouseProfile: [{
            ref: {type: db.Schema.Types.ObjectId, ref: 'House', required: false},
            name: {type: String, required: true, select: true},
            thumbnail: {type: String, required: true, select: true}
        }]
});

module.exports = db.model('User', user);

/* 2017-02-06 Guri: To be fixed: commented this out since we don't implement a password reset at the moment */
function addDaysToDefaultDate  (days) {
    var timeObject = new Date();
    timeObject.setDate(timeObject.getDate() + days);
    return timeObject;
};
