//2017-02-19 Guri lurer på hvorfor den globale variabelen "vidom" ikke er deklarert her, ref feilmelding.
vidom.controller('HouseProfileCtlr', function ($scope, $rootScope, $sce, $routeParams, HouseProfileSvc, ImageFctr, $location) {

    var profilePictureCanvas = null, ctx = null, img = null;
    var picture0Canvas = null;
    var img0 = null;

    $scope.partial = $routeParams.partial;
    $scope.profileId = $routeParams.id;

    $scope.basicInfoIsEditing = false;
    $scope.buildingSectionIsEditing = false;
    $scope.pictureSectionIsEditing = false;

    HouseProfileSvc.getProfile($routeParams.id).then(function (response) {
        $scope.profile = response;
        $scope.currentProjectUrl = $sce.trustAsResourceUrl($scope.profile.mapq);
        loadThumbnail();
    }, function (err) {
        console.log(err);
    });

    $scope.readURL = function (input) {
        if (input.files && input.files[0]) {

            var FR = new FileReader();
            FR.onload = function (e) {
                ImageFctr.prepareImageDataURIFromCanvas(200, 150, e.target.result).then(function (uri) {
                    $scope.img200x150URI = uri;
                });
                ImageFctr.prepareImageDataURIFromCanvas(400, 300, e.target.result, "canvas").then(function (uri) {
                    $scope.img400x300URI = uri;
                });
                ImageFctr.prepareImageDataURIFromCanvas(600, 400, e.target.result).then(function (uri) {
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
            img.src = '/img/default.png';
            return;
        }

        if ($scope.profile.profilePicture.path.indexOf("200x150")) {
            var modify = $scope.profile.profilePicture.path.split('/');
            pic = modify[modify.length - 1];
        } else {
            pic = $scope.profile.profilePicture.path;
        }
        img.src = $scope.profile.profilePicture ? 'https://vidomtestbucket.s3.amazonaws.com/' + $scope.profileId + '/400x300/' + pic : '/img/default.png';

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
            console.log("\nReloading the profile picture1");
        };
/*        
        picture0Canvas = document.getElementById("profile0-canvas");
        ctx = picture0Canvas.getContext("2d");
        img0 = new Image();
        img0.crossOrigin = "Anonymous"; //cors support
        img0.onload = function () {
            var W = img0.width;
            var H = img0.height;
            picture0Canvas.width = W;
            picture0Canvas.height = H;
            ctx.drawImage(img0, 0, 0); //draw image
            console.log("\nReloading picture0");
        };
*/        
    });

    $scope.addInhabitant = function (firstName, lastName, email, sendInvitation) {
        console.log("Not implemented");
    };

    $scope.updateSection = function () {
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
//                console.log("\nReloading pictures");
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
        $scope.editingSectionId = id;
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
                ;
                break;
            case 'pictures':
                $scope.mutableProfile = null;
                $scope.pictureSectionIsEditing = false;
                ;
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
        
        HouseProfileSvc.savePicture(houseId, '200x150/' + file.name, file.type, new File([img200x150URI], {type: file.type}), true, -1, userId).then(function () {

            img.setAttribute("src", $scope.img400x300URI); //load the image onto the profilePicture placement in the houseProfile.html.
            HouseProfileSvc.savePicture(houseId, '400x300/' + file.name, file.type, new File([img400x300URI], {type: file.type}), false, -1, userId);
            HouseProfileSvc.savePicture(houseId, '600x400/' + file.name, file.type, new File([img600x400URI], {type: file.type}), false, -1, userId);
        });

//2017-02-07 Guri: The closing of the modal must be moved somewhere different, I assume.
        $('#profilePictureModal').modal('hide');
    };


//2017-03-01 Guri: Start of hardcoding the ten pictures. This has to be done differently in the future.
    $scope.savePicture0 = function () {
        
        var file = document.getElementById('file0').files[0];

        var img200x150URI = dataURItoBlob($scope.img200x150URI);
        var img400x300URI = dataURItoBlob($scope.img400x300URI);
        var img600x400URI = dataURItoBlob($scope.img600x400URI);

        var houseId = $routeParams.id;
        var userId = $rootScope.user._id;
        
        HouseProfileSvc.savePicture(houseId, '200x150/' + file.name, file.type, new File([img200x150URI], {type: file.type}), true, 0, userId).then(function () {
//            img.setAttribute("src", $scope.img400x300URI); //load the image onto the profilePicture placement in the houseProfile.html.
            HouseProfileSvc.savePicture(houseId, '400x300/' + file.name, file.type, new File([img400x300URI], {type: file.type}), false, 0, userId);
            HouseProfileSvc.savePicture(houseId, '600x400/' + file.name, file.type, new File([img600x400URI], {type: file.type}), false, 0, userId);
        });

//2017-02-07 Guri: The closing of the modal must be moved somewhere different, I assume.
        $('#addPicture0Modal').modal('hide');
    };

    $scope.savePicture1 = function () {
        
        var file = document.getElementById('file1').files[0];

        var img200x150URI = dataURItoBlob($scope.img200x150URI);
        var img400x300URI = dataURItoBlob($scope.img400x300URI);
        var img600x400URI = dataURItoBlob($scope.img600x400URI);

        var houseId = $routeParams.id;
        var userId = $rootScope.user._id;
        
        HouseProfileSvc.savePicture(houseId, '200x150/' + file.name, file.type, new File([img200x150URI], {type: file.type}), true, 1, userId).then(function () {
            HouseProfileSvc.savePicture(houseId, '400x300/' + file.name, file.type, new File([img400x300URI], {type: file.type}), false, 1, userId);
            HouseProfileSvc.savePicture(houseId, '600x400/' + file.name, file.type, new File([img600x400URI], {type: file.type}), false, 1, userId);
        });

//2017-02-07 Guri: The closing of the modal must be moved somewhere different, I assume.
        $('#addPicture1Modal').modal('hide');
    };

    $scope.savePicture2 = function () {
        
        var file = document.getElementById('file2').files[0];

        var img200x150URI = dataURItoBlob($scope.img200x150URI);
        var img400x300URI = dataURItoBlob($scope.img400x300URI);
        var img600x400URI = dataURItoBlob($scope.img600x400URI);

        var houseId = $routeParams.id;
        var userId = $rootScope.user._id;
        
        HouseProfileSvc.savePicture(houseId, '200x150/' + file.name, file.type, new File([img200x150URI], {type: file.type}), true, 2, userId).then(function () {
            HouseProfileSvc.savePicture(houseId, '400x300/' + file.name, file.type, new File([img400x300URI], {type: file.type}), false, 2, userId);
            HouseProfileSvc.savePicture(houseId, '600x400/' + file.name, file.type, new File([img600x400URI], {type: file.type}), false, 2, userId);
        });

//2017-02-07 Guri: The closing of the modal must be moved somewhere different, I assume.
        $('#addPicture2Modal').modal('hide');
    };

    $scope.savePicture2 = function () {
        
        var file = document.getElementById('file2').files[0];

        var img200x150URI = dataURItoBlob($scope.img200x150URI);
        var img400x300URI = dataURItoBlob($scope.img400x300URI);
        var img600x400URI = dataURItoBlob($scope.img600x400URI);

        var houseId = $routeParams.id;
        var userId = $rootScope.user._id;
        
        HouseProfileSvc.savePicture(houseId, '200x150/' + file.name, file.type, new File([img200x150URI], {type: file.type}), true, 2, userId).then(function () {
            HouseProfileSvc.savePicture(houseId, '400x300/' + file.name, file.type, new File([img400x300URI], {type: file.type}), false, 2, userId);
            HouseProfileSvc.savePicture(houseId, '600x400/' + file.name, file.type, new File([img600x400URI], {type: file.type}), false, 2, userId);
        });

//2017-02-07 Guri: The closing of the modal must be moved somewhere different, I assume.
        $('#addPicture2Modal').modal('hide');
    };

    $scope.savePicture3 = function () {
        
        var file = document.getElementById('file3').files[0];

        var img200x150URI = dataURItoBlob($scope.img200x150URI);
        var img400x300URI = dataURItoBlob($scope.img400x300URI);
        var img600x400URI = dataURItoBlob($scope.img600x400URI);

        var houseId = $routeParams.id;
        var userId = $rootScope.user._id;
        
        HouseProfileSvc.savePicture(houseId, '200x150/' + file.name, file.type, new File([img200x150URI], {type: file.type}), true, 3, userId).then(function () {
            HouseProfileSvc.savePicture(houseId, '400x300/' + file.name, file.type, new File([img400x300URI], {type: file.type}), false, 3, userId);
            HouseProfileSvc.savePicture(houseId, '600x400/' + file.name, file.type, new File([img600x400URI], {type: file.type}), false, 3, userId);
        });

//2017-02-07 Guri: The closing of the modal must be moved somewhere different, I assume.
        $('#addPicture3Modal').modal('hide');
    };

    $scope.savePicture4 = function () {
        
        var file = document.getElementById('file4').files[0];

        var img200x150URI = dataURItoBlob($scope.img200x150URI);
        var img400x300URI = dataURItoBlob($scope.img400x300URI);
        var img600x400URI = dataURItoBlob($scope.img600x400URI);

        var houseId = $routeParams.id;
        var userId = $rootScope.user._id;
        
        HouseProfileSvc.savePicture(houseId, '200x150/' + file.name, file.type, new File([img200x150URI], {type: file.type}), true, 4, userId).then(function () {
            HouseProfileSvc.savePicture(houseId, '400x300/' + file.name, file.type, new File([img400x300URI], {type: file.type}), false, 4, userId);
            HouseProfileSvc.savePicture(houseId, '600x400/' + file.name, file.type, new File([img600x400URI], {type: file.type}), false, 4, userId);
        });

//2017-02-07 Guri: The closing of the modal must be moved somewhere different, I assume.
        $('#addPicture4Modal').modal('hide');
    };

    $scope.savePicture5 = function () {
        
        var file = document.getElementById('file5').files[0];

        var img200x150URI = dataURItoBlob($scope.img200x150URI);
        var img400x300URI = dataURItoBlob($scope.img400x300URI);
        var img600x400URI = dataURItoBlob($scope.img600x400URI);

        var houseId = $routeParams.id;
        var userId = $rootScope.user._id;
        
        HouseProfileSvc.savePicture(houseId, '200x150/' + file.name, file.type, new File([img200x150URI], {type: file.type}), true, 5, userId).then(function () {
            HouseProfileSvc.savePicture(houseId, '400x300/' + file.name, file.type, new File([img400x300URI], {type: file.type}), false, 5, userId);
            HouseProfileSvc.savePicture(houseId, '600x400/' + file.name, file.type, new File([img600x400URI], {type: file.type}), false, 5, userId);
        });

//2017-02-07 Guri: The closing of the modal must be moved somewhere different, I assume.
        $('#addPicture5Modal').modal('hide');
    };

    $scope.savePicture6 = function () {
        
        var file = document.getElementById('file6').files[0];

        var img200x150URI = dataURItoBlob($scope.img200x150URI);
        var img400x300URI = dataURItoBlob($scope.img400x300URI);
        var img600x400URI = dataURItoBlob($scope.img600x400URI);

        var houseId = $routeParams.id;
        var userId = $rootScope.user._id;
        
        HouseProfileSvc.savePicture(houseId, '200x150/' + file.name, file.type, new File([img200x150URI], {type: file.type}), true, 6, userId).then(function () {
            HouseProfileSvc.savePicture(houseId, '400x300/' + file.name, file.type, new File([img400x300URI], {type: file.type}), false, 6, userId);
            HouseProfileSvc.savePicture(houseId, '600x400/' + file.name, file.type, new File([img600x400URI], {type: file.type}), false, 6, userId);
        });

//2017-02-07 Guri: The closing of the modal must be moved somewhere different, I assume.
        $('#addPicture6Modal').modal('hide');
    };

    $scope.savePicture7 = function () {
        
        var file = document.getElementById('file7').files[0];

        var img200x150URI = dataURItoBlob($scope.img200x150URI);
        var img400x300URI = dataURItoBlob($scope.img400x300URI);
        var img600x400URI = dataURItoBlob($scope.img600x400URI);

        var houseId = $routeParams.id;
        var userId = $rootScope.user._id;
        
        HouseProfileSvc.savePicture(houseId, '200x150/' + file.name, file.type, new File([img200x150URI], {type: file.type}), true, 7, userId).then(function () {
            HouseProfileSvc.savePicture(houseId, '400x300/' + file.name, file.type, new File([img400x300URI], {type: file.type}), false, 7, userId);
            HouseProfileSvc.savePicture(houseId, '600x400/' + file.name, file.type, new File([img600x400URI], {type: file.type}), false, 7, userId);
        });

//2017-02-07 Guri: The closing of the modal must be moved somewhere different, I assume.
        $('#addPicture7Modal').modal('hide');
    };

    $scope.savePicture8 = function () {
        
        var file = document.getElementById('file8').files[0];

        var img200x150URI = dataURItoBlob($scope.img200x150URI);
        var img400x300URI = dataURItoBlob($scope.img400x300URI);
        var img600x400URI = dataURItoBlob($scope.img600x400URI);

        var houseId = $routeParams.id;
        var userId = $rootScope.user._id;
        
        HouseProfileSvc.savePicture(houseId, '200x150/' + file.name, file.type, new File([img200x150URI], {type: file.type}), true, 8, userId).then(function () {
            HouseProfileSvc.savePicture(houseId, '400x300/' + file.name, file.type, new File([img400x300URI], {type: file.type}), false, 8, userId);
            HouseProfileSvc.savePicture(houseId, '600x400/' + file.name, file.type, new File([img600x400URI], {type: file.type}), false, 8, userId);
        });

//2017-02-07 Guri: The closing of the modal must be moved somewhere different, I assume.
        $('#addPicture8Modal').modal('hide');
    };

    $scope.savePicture9 = function () {
        
        var file = document.getElementById('file9').files[0];

        var img200x150URI = dataURItoBlob($scope.img200x150URI);
        var img400x300URI = dataURItoBlob($scope.img400x300URI);
        var img600x400URI = dataURItoBlob($scope.img600x400URI);

        var houseId = $routeParams.id;
        var userId = $rootScope.user._id;
        
        HouseProfileSvc.savePicture(houseId, '200x150/' + file.name, file.type, new File([img200x150URI], {type: file.type}), true, 9, userId).then(function () {
            HouseProfileSvc.savePicture(houseId, '400x300/' + file.name, file.type, new File([img400x300URI], {type: file.type}), false, 9, userId);
            HouseProfileSvc.savePicture(houseId, '600x400/' + file.name, file.type, new File([img600x400URI], {type: file.type}), false, 9, userId);
        });

//2017-02-07 Guri: The closing of the modal must be moved somewhere different, I assume.
        $('#addPicture9Modal').modal('hide');
    };

});