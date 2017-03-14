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
    profilePicture: {type: imageModel.schema, required: false, select: true},   
    backgroundPicture: {type: imageModel.schema, required: false, select: true},  
    //2017-03-05 Guri: Yes, these pictures should be added to the pictures-array. Just couldn't figure out how to do it prior to the release deadline.
    picture0: {type: imageModel.schema, required: false, select: true},
    picture1: {type: imageModel.schema, required: false, select: true},
    picture2: {type: imageModel.schema, required: false, select: true},
    picture3: {type: imageModel.schema, required: false, select: true},
    picture4: {type: imageModel.schema, required: false, select: true},
    picture5: {type: imageModel.schema, required: false, select: true},
    picture6: {type: imageModel.schema, required: false, select: true},
    picture7: {type: imageModel.schema, required: false, select: true},
    address: {type: addressModel.schema, required: false},
    builtYear: {type: Number, required: false},
    movedInYear: {type: Number, required: false},
    ownership: {type: String, select: true, required: false},
    storages: {type: Number, required: false},
    meters: {type: Number, required: false},
    rooms: {type: Number, required: false},
    notes: {type: String, select: true, required: false},
    facilities: [{id: String, label: String}]
});
module.exports = db.model('House', house);