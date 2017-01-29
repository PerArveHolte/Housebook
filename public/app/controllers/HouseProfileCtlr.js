housebook.controller('HouseProfileCtlr', function ($scope, $rootScope, $sce, $routeParams, HouseProfileSvc, ImageFctr, $location) {

    var profilePictureCanvas = null, ctx = null, img = null;

    $scope.partial = $routeParams.partial;
    $scope.profileId = $routeParams.id;

    $scope.basicInfoIsEditing = false;
    $scope.buildingSectionIsEditing = false;

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
    }

    $scope.savePicture = function () {
        var file = document.getElementById('file').files[0];

        var img200x150URI = dataURItoBlob($scope.img200x150URI);
        var img400x300URI = dataURItoBlob($scope.img400x300URI);
        var img600x400URI = dataURItoBlob($scope.img600x400URI);

        HouseProfileSvc.savePicture($routeParams.id, '200x150/' + file.name, file.type, new File([img200x150URI], {type: file.type}), true, $rootScope.user._id).then(function () {
            img.setAttribute("src", $scope.img400x300URI);
            HouseProfileSvc.savePicture($routeParams.id, '400x300/' + file.name, file.type, new File([img400x300URI], {type: file.type}), false, $rootScope.user._id);
            HouseProfileSvc.savePicture($routeParams.id, '600x400/' + file.name, file.type, new File([img600x400URI], {type: file.type}), false, $rootScope.user._id);
        });

        $('#basicPropertiesModal').modal('hide');
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
//        img.src = $scope.profile.profilePicture ? 'https://s3.amazonaws.com/housebook-uploads-staging/' + $scope.profileId + '/400x300/' + pic : '/img/default.png';
        img.src = $scope.profile.profilePicture ? 'https://s3.amazonaws.com/vidomtestbucket/' + $scope.profileId + '/400x300/' + pic : '/img/default.png';
    }

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
            default:
                break;
        }
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
                
                //TODO: figure out better way of handling this
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
            default:
                break;
        }
    };
});