var db = require('../db');
var addressModel = require('../model/address');
var imageModel = require('../model/image');

var house = db.Schema({
    name: {type: String, select: true, required: true},
    type: {type: String, select: true, required: false},
    createdBy: {type: db.Schema.Types.ObjectId, ref: 'User', required: false},
    inhabitants: [{type: db.Schema.Types.ObjectId, ref: 'User', required: false}],
    manuals: [{type: String, required: false}],
    pictures: [{type: db.Schema.Types.ObjectId, ref: 'Image', required: false}],
    profilePicture: {type: imageModel.schema, required: false, select: true},   //foreign-key
    backgroundPicture: {type: imageModel.schema, required: false, select: true},  //foreign-key
    picture1: {type: imageModel.schema, required: false, select: true}, //2017-02-07 Guri: Added
    address: {type: addressModel.schema, required: false},
    builtYear: {type: Number, required: false},
    movedInYear: {type: Number, required: false},
    ownership: {type: String, select: true, required: false},
    storages: {type: Number, required: false},
    meters: {type: Number, required: false},
    rooms: {type: Number, required: false},
    facilities: [{id: String, label: String}]
});
module.exports = db.model('House', house);