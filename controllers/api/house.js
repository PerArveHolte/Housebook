var router = require('express').Router();

var jwt = require('jwt-simple');
var helper = require('../helperFunctions');
var ObjectId = require('mongodb').ObjectID;
var config = require('../../config');

var House = require('../../model/house');
var Address = require('../../model/address');
var User = require('../../model/user');
var Image = require('../../model/image');


router.get('/:profileId', function (req, res, next) {
    if (!req.headers['x-auth'] || !req.headers['x-auth'].length) {
        console.log("Missing token");
        return res.sendStatus(401);
    }
//    console.log("req.params.profileId " + req.params.profileId);
    House.findOne({"_id": ObjectId(req.params.profileId)})
            .populate({path: 'createdBy'})
            .populate({path: 'inhabitants'})
            .exec(function (err, house) {
                if (err) {
                    return next(err);
                } else {
                    return res.json(house);
                }
            });
});

router.post('/:profileId', function (req, res, next) {
    if (!req.headers['x-auth'] || !req.headers['x-auth'].length) {
        console.log("Missing token");
        return res.sendStatus(401);
    }
//    console.log("Inside router.post");
    console.log("House_id is: " +req.params.profileId);

    //The exec-function is executing query towards the database
    House.findOne({"_id": ObjectId(req.params.profileId)}).exec(function (err, house) {
        if (err)
            return next(err);
        console.log("req.body.contentType is: " + req.body.contentType);

        if (req.body.contentType) {
            console.log("create img object");

            var picture = new Image({
                path: req.params.profileId + '/' + req.body.fileName,
                uploaded: new Date(),
                uploadedBy: req.body.userId
            });

            if (req.body.isProfilePicture) {
                console.log("\nPrepare img to save with house");
                console.log("\n\nThe theory is that profilePicture does not exist in house document yet");
                console.log("House is: " +house);
                console.log("house.profilePicture is: "+house.profilePicture);
                //picture.isProfilePicture = true;
                house.profilePicture = picture;
                house.backgroudPicture = picture;
                console.log("\n\nSaving profile picture");
                console.log("House is: " +house);
            }

            //2017-02-19 Guri trying to add another picture to the database
            if(!req.body.isProfilePicture){
//                picture.isProfilePicture = false;
 //               house.pictures[0] = picture;
//                house.backgroudPicture = picture;
//                console.log("\nSaving another picture");
//                console.log("House is: " +house);
//                console.log("House.profilePicture is: "+house.profilePicture);
//                console.log("house.pictures[0] is: "+house.pictures[0]);
//                console.log("house.backgroudPicture is: "+house.backgroudPicture);
//                console.log("ObjectId(req.params.profileId) is: " +ObjectId(req.params.profileId));
            }
            // End of Guri's struggles

            house.save(function (err) {
                if (err)
                    return next(err);
//                console.log("House is: " +house);
//                console.log("ObjectId(req.params.profileId) is: " +ObjectId(req.params.profileId));
            });
        }

        return res.sendStatus(201);
    });
});


/*Create house profile*/
router.post('/', function (req, res, next) {
    console.log("\nInside file: house.js, function: router.post");
    if (!req.headers['x-auth'] || !req.headers['x-auth'].length) {
        return res.sendStatus(401);
    }

    var auth = jwt.decode(req.headers['x-auth'], config.secret);

    var address = new Address({
        street1: req.body.address.street1,
        street2: req.body.address.street2,
        postalCode: req.body.address.postalCode,
        city: req.body.address.city,
// 2017-02-06 Guri commented this out as state is not relevant for Norway 
        //state: req.body.address.state,
        
        country: req.body.address.country
    });

    var house = new House({
        name: req.body.name,
        createdBy: req.body.createdBy,
        movedInYear: req.body.movedInYear,
        ownership: req.body.ownership,
        address: address
    });
    
    console.log("\nhouse is created: "+house);
    console.log("Sending house with JSON.stringify(house):" + JSON.stringify(house));
    User.findOne({username: auth.username}).exec(function (err, user) {
        house.createdBy = user._id;
        house.save(function (err) {
            if (err) {
                console.log(err);
                return next(err);
            }

            User.findOne({"_id": ObjectId(house.createdBy)}).exec(function (err, user) {
                user.createdHouseProfile.push({ref: house._id, name: house.name, thumbnail: 'test'});
                user.save();
            });

            console.log("Res is: "+res);
            console.log("house._id is: "+house._id);
            return res.send(house._id);
        });
    });
});

/*Update house profile*/
router.put('/:profileId', function (req, res, next) {
    if (!req.headers['x-auth'] || !req.headers['x-auth'].length) {
        console.log("Missing token");
        return res.status(401).send("You need to be authenticated to perform this operation");
    }

    House.findOne({"_id": ObjectId(req.params.profileId)}).exec(function (err, house) {
        if (err)
            return next(err);

        if (!helper.objectsAreTheSame(req.body.name, house.name)) {
            house.name = req.body.name;
        }
        if (!helper.objectsAreTheSame(req.body.type, house.type)) {
            house.type = req.body.type;
        }
        if (!helper.objectsAreTheSame(req.body.movedInYear, house.movedInYear)) {
            house.movedInYear = req.body.movedInYear;
        }
        if (!helper.objectsAreTheSame(req.body.ownership, house.ownership)) {
            house.ownership = req.body.ownership;
        }
        if (!helper.objectsAreTheSame(req.body.builtYear, house.builtYear)) {
            house.builtYear = req.body.builtYear;
        }
        if (!helper.objectsAreTheSame(req.body.storages, house.storages)) {
            house.storages = req.body.storages;
        }
        if (!helper.objectsAreTheSame(req.body.meters, house.meters)) {
            house.meters = req.body.meters;
        }
        if (!helper.objectsAreTheSame(req.body.rooms, house.rooms)) {
            house.rooms = req.body.rooms;
        }
        if (req.body.address) {
            if (!helper.objectsAreTheSame(req.body.address.street1, house.address.street1)) {
                house.address.street1 = req.body.address.street1;
            }
            if (!helper.objectsAreTheSame(req.body.address.street2, house.address.street2)) {
                house.address.street2 = req.body.address.street2;
            }
            if (!helper.objectsAreTheSame(req.body.address.postalCode, house.address.postalCode)) {
                house.address.postalCode = req.body.address.postalCode;
            }
            if (!helper.objectsAreTheSame(req.body.address.city, house.address.city)) {
                house.address.city = req.body.address.city;
            }
// 2017-02-05 Guri commented out "state" for now.
//            if (!helper.objectsAreTheSame(req.body.address.state, house.address.state)) {
//                house.address.state = req.body.address.state;
//            }

            if (!helper.objectsAreTheSame(req.body.address.country, house.address.country)) {
                house.address.country = req.body.address.country;
            }
        }
        if (!helper.objectsAreTheSame(req.body.facilitiesArr, house.facilities)) {
            house.facilities = req.body.facilitiesArr;
        }

        house.save(function (err) {
            if (err) {
                console.log(err);
                return next(err);
            }
            return res.sendStatus(201);

        });
    });


});

module.exports = router;
