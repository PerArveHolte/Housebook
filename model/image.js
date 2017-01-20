var db = require('../db');

var image = db.Schema({
    path: String,
    isProfilePicture: Boolean,
    uploaded:{type: Date, default: Date.now},
    uploadedBy:{type: db.Schema.Types.ObjectId, ref: 'User', required: true}
});

module.exports = db.model('Image', image);