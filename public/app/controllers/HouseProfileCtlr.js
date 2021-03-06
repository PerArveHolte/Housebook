"use strict";

//2017-02-19 Guri lurer på hvorfor den globale variabelen "vidom" ikke er deklarert her, ref feilmelding.
vidom.controller('HouseProfileCtlr', function ($scope, $rootScope, $sce, $routeParams, HouseProfileSvc, ImageFctr, $location, envService, $q) {
    $scope.imageBucket = envService.read('s3bucket');
    var profilePictureCanvas = null, ctx = null, img = null;

    $scope.partial = $routeParams.partial;
    $scope.profileId = $routeParams.id;

    $scope.basicInfoIsEditing = false;
    $scope.buildingSectionIsEditing = false;
    $scope.pictureSectionIsEditing = false;

    $scope.loadProfile = function() {
        HouseProfileSvc.getProfile($routeParams.id).then(function (response) {
            $scope.profile = response;
            $scope.currentProjectUrl = $sce.trustAsResourceUrl($scope.profile.mapq);
            loadThumbnail();
        }, function (err) {
            console.log(err);
        });
    };
    $scope.loadProfile();

//    $scope.readURL = function (input) {
    $scope.readURL = function (input, canvas) {
        if (input.files && input.files[0]) {

            var FR = new FileReader();
            FR.onload = function (e) {
                ImageFctr.prepareImageDataURIFromCanvas(200, 150, e.target.result).then(function (uri) {
                    $scope.img200x150URI = uri;
                });
//                ImageFctr.prepareImageDataURIFromCanvas(400, 300, e.target.result, "canvas").then(function (uri) {
                ImageFctr.prepareImageDataURIFromCanvas(400, 300, e.target.result).then(function (uri) {
                    $scope.img400x300URI = uri;
                });
                ImageFctr.prepareImageDataURIFromCanvas(600, 400, e.target.result, canvas).then(function (uri) {
                    $scope.img600x400URI = uri;
                });
                $scope.$apply();
            };
            FR.readAsDataURL(input.files[0]);
        }
    };


    function loadThumbnail() {
        var pic = null;
        if (!$scope.profile.profilePicture) {
            img.src = '/img/default.jpg';
            return;
        }

        if ($scope.profile.profilePicture.path.indexOf("200x150")) {
            var modify = $scope.profile.profilePicture.path.split('/');
            pic = modify[modify.length - 1];
        } else {
            pic = $scope.profile.profilePicture.path;
        }
        img.src = $scope.profile.profilePicture ? 'https://' + $scope.imageBucket + '.s3.amazonaws.com/' + $scope.profileId + '/400x300/' + pic : '/img/default.jpg';

    };

    //load on start
    $(function () {
        $("input#file").change(function () { //set up a common class
            $scope.readURL(this);
        });
        
        profilePictureCanvas = document.getElementById("house-profile-canvas");
        ctx = profilePictureCanvas.getContext("2d");
        img = new Image();
        img.crossOrigin = "Anonymous"; //cors support
        img.onload = function () {
            var W = img.width;
            var H = img.height;
            profilePictureCanvas.width = W;
            profilePictureCanvas.height = H;
            ctx.drawImage(img, 0, 0); //draw image
        };
    });

    $scope.addInhabitant = function (firstName, lastName, email, sendInvitation) {
        console.log("Not implemented");
    };

    $scope.updateSection = function () {
        console.log("Inside updateSection. the following editSectionid is identified: "+$scope.editSectionId);
        switch ($scope.editingSectionId) {
            case 'basicInfo':
                $scope.profile = $scope.mutableProfile;
                $scope.profile.mapq = HouseProfileSvc.updateMapLink($scope.profile);
                $scope.currentProjectUrl = $sce.trustAsResourceUrl($scope.profile.mapq);
                HouseProfileSvc.updateProfile($scope.profile).then(function () {
                    $scope.mutableProfile = null;
                    $scope.basicInfoIsEditing = false;
                });

                break;
            case 'building':
                $scope.profile = $scope.mutableProfile;
                $scope.profile.facilities = _.filter($scope.profile.facilities, {selected: true});
                $scope.profile.facilitiesArr = _.map($scope.profile.facilities, function (f) {
                    return _.omit(f, 'selected', '$$hash', '_id');
                });
                HouseProfileSvc.updateProfile($scope.profile).then(function () {
                    $scope.mutableProfile = null;
                    $scope.buildingSectionIsEditing = false;
                });
                break;
            case 'pictures':
                $scope.profile = $scope.mutableProfile;
                $scope.profile.pictures = _.filter($scope.profile.pictures, {selected: true});
                console.log("\nReloading pictures");
                HouseProfileSvc.updateProfile($scope.profile).then(function () {
                    $scope.mutableProfile = null;
                    $scope.pictureSectionIsEditing = false;
//                    console.log("Updating pictures");
                });
                break;
            default:
                HouseProfileSvc.updateProfile($scope.profile).then(function () {
                    $scope.profileNameIsEditing = false;
                });
                break;
        }
    };

    $scope.editSection = function (id) {
        //2017-03-07 Guri is wondering what happens if we take a away the editingSectionId global variable.
        $scope.editingSectionId = id;
        console.log("id is: " +id);
        console.log("Inside editSection. the following editSectionid is identified: "+$scope.editSectionId);
        switch (id) {
            case 'basicInfo':
                $scope.basicInfoIsEditing = true;
                $scope.mutableProfile = angular.copy($scope.profile);
                break;
            case 'building':
                $scope.buildingSectionIsEditing = true;
                $scope.mutableProfile = angular.copy($scope.profile);
                
                //TODO Kamila: figure out better way of handling this
                var allFacilities = [{id: 'parking', label: 'Parking place'}, {id: 'garage', label: 'Garage'}, {id: 'elevator', label: 'Elevator'}, {id: 'terrace', label: 'Terrace'}, {id: 'guard', label: 'Guard'}, {id: 'fireplace', label: 'Fireplace'}, {id: 'sauna', label: 'Sauna'}, {id: 'garden', label: 'Garden'}];
                if ($scope.mutableProfile.facilities.length) {
                    var selectedKeys = _.pluck($scope.profile.facilities, 'id');
                    _.each(allFacilities, function (f) {
                        if (selectedKeys.indexOf(f.id)>-1)
                            f.selected = true;
                    });
                }
                $scope.mutableProfile.facilities = allFacilities;
                break;
            case 'pictures':
                console.log("Hurray! Inside pictures switch");
                $scope.pictureSectionIsEditing = true;
                $scope.mutableProfile = angular.copy($scope.profile);
                break;
            default:
                break;
        }
    };

    $scope.cancelEditingSection = function () {
        switch ($scope.editingSectionId) {
            case 'basicInfo':
                $scope.mutableProfile = null;
                $scope.basicInfoIsEditing = false;
                break;
            case 'building':
                $scope.mutableProfile = null;
                $scope.buildingSectionIsEditing = false;
                break;
            case 'pictures':
                $scope.mutableProfile = null;
                $scope.pictureSectionIsEditing = false;
                break;
        default:
                break;
        }
    };


//2017-02-18 Guri: Todo: Rename this function to "saveProfilePicture" and create another one for saving of other pictures
    $scope.saveProfilePicture = function () {
//2017-02-13 Guri: Was wondering if it would be better to send the file as an argument rather then finding it here..
        var file = document.getElementById('profilePictureFile').files[0];

        var img200x150URI = dataURItoBlob($scope.img200x150URI);
        var img400x300URI = dataURItoBlob($scope.img400x300URI);
        var img600x400URI = dataURItoBlob($scope.img600x400URI);

        var houseId = $routeParams.id;
        var userId = $rootScope.user._id;
        
        HouseProfileSvc.savePicture(houseId, '200x150/' + file.name, file.type, new Blob([img200x150URI], {type: file.type}), true, -1, userId).then(function () {

            img.setAttribute("src", $scope.img400x300URI); //load the image onto the profilePicture placement in the houseProfile.html.
            HouseProfileSvc.savePicture(houseId, '400x300/' + file.name, file.type, new Blob([img400x300URI], {type: file.type}), false, -1, userId);
            HouseProfileSvc.savePicture(houseId, '600x400/' + file.name, file.type, new Blob([img600x400URI], {type: file.type}), false, -1, userId);
        });

//2017-02-07 Guri: The closing of the modal must be moved somewhere different, I assume.
        $('#profilePictureModal').modal('hide');
    };


//2017-03-01 Guri: Start of hardcoding the ten pictures. This has to be done differently in the future.
    $scope.savePicture = function (pictureNo, fileId) {
        
        var file = document.getElementById(fileId).files[0];

        var img200x150URI = dataURItoBlob($scope.img200x150URI);
        var img400x300URI = dataURItoBlob($scope.img400x300URI);
        var img600x400URI = dataURItoBlob($scope.img600x400URI);

        var houseId = $routeParams.id;
        var userId = $rootScope.user._id;
        
        HouseProfileSvc.savePicture(houseId, '200x150/' + file.name, file.type, new Blob([img200x150URI], {type: file.type}), true, pictureNo, userId).then(function (response) {
            var promises = [];
            promises.push(HouseProfileSvc.savePicture(houseId, '400x300/' + file.name, file.type, new Blob([img400x300URI], {type: file.type}), false, pictureNo, userId));
            promises.push(HouseProfileSvc.savePicture(houseId, '600x400/' + file.name, file.type, new Blob([img600x400URI], {type: file.type}), false, pictureNo, userId));
            
            $q.all(promises).then(new function() {
                //console.log($scope.profile);
                $scope.loadProfile();
                $scope.updateSection();
                //document.location.reload();
            });
        });

//2017-02-07 Guri: The closing of the modals should be moved somewhere different, I assume.
        $('#addPicture0Modal').modal('hide');
        $('#addPicture1Modal').modal('hide');
        $('#addPicture2Modal').modal('hide');
        $('#addPicture3Modal').modal('hide');
        $('#addPicture4Modal').modal('hide');
        $('#addPicture5Modal').modal('hide');
        $('#addPicture6Modal').modal('hide');
        $('#addPicture7Modal').modal('hide');
    };

});