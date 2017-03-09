var db = require('../db');

var image = db.Schema({
    path: String,
    corePath: String,
    isProfilePicture: Boolean,
    uploaded:{type: Date, default: Date.now},
    uploadedBy:{type: db.Schema.Types.ObjectId, ref: 'User', required: true},
    upvotes: {type: Number, default: 0}
});

module.exports = db.model('Image', image);