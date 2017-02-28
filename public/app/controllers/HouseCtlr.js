//2017-02-12 Guri: Was wondering if this "HouseCtlr" actually should be named "UserCtlr"?
vidom.controller('HouseCtlr', function ($scope, $rootScope, $location, HouseProfileSvc) {
    $scope.houses = $rootScope.user ? $rootScope.user.createdHouseProfile : [];
    angular.forEach($scope.houses, function(houseProfile){
        if (houseProfile.ref && houseProfile.ref.profilePicture){
            console.log("\nProfile picture");
            houseProfile.thumbnail = "https://vidomtestbucket.s3.amazonaws.com/"+houseProfile.ref.profilePicture.path;
        }else {
            houseProfile.thumbnail = "/img/defaultSmall.png";
        }
    });

    $scope.defaultHouseSpace = {_id: -1, name: "default house space", description: "Demo house profile"};

    $scope.goToCreateHouseProfilePage = function () {
        $location.path('/house/create');
        return false;
    };

    $scope.saveHouseProfile = function (profile) {
        console.log(JSON.stringify(profile));
        HouseProfileSvc.createProfile(profile).then(function (response) {
            $location.path('/house/'+response.data);
            return false;
        });
    };
    
    $scope.openHouseProfile=function(id){
        return $location.path('/house/'+id);
    };
    
});