vidom.service('HouseProfileSvc', function ($q, $http) {
    var obj = {};
    obj._mapLink = "https://www.google.com/maps/embed/v1/place?key=AIzaSyBK5uabiBpR15vbeg-DYFZq9GuQsQNImWY&q=";

    obj.getProfile = function (profileId) {
        var defer = $q.defer();
        $http.get('/house/' + profileId, {headers: {'x-auth': localStorage.getItem('token')}}).then(function (response) {
            var profile = response.data;
            profile.mapq = obj.updateMapLink(profile);

            defer.resolve(profile);
        });

        return defer.promise;
    };
    
    obj.savePicture = function (profileId, name, type, file, isProfilePicture, createdBy) {
        var defer = $q.defer();
        var data = {profileId: profileId, fileName: name, fileType: file.type}; //2017-02-19 Guri: The file.type variable seems to be empty.
        $http({
            method: 'GET',
            url: '/aws/sign-s3',
            params: data
        }).then(function (response) {
            $http({
                method: 'PUT',
                url: response.data.signedRequest,
                data: file,
                headers: {'Content-type': file.type}
            }).then(function (uploadResponse) {
                console.log("Successfully put something somewhere..");
                console.log("uploadResponse is: "+ uploadResponse);
                console.log("uploadResponse.data is: " + uploadResponse.data);
                console.log("uploadResponse.status is: " + uploadResponse.status);
                console.log("uploadResponse.headers is: " + uploadResponse.headers);
                console.log("uploadResponse.config is: " + uploadResponse.config);
                console.log("uploadResponse.statusText is: " + uploadResponse.statusText);
                
                var payload = {fileName: name, contentType: type, isProfilePicture: isProfilePicture, userId: createdBy};

                $http.post('/house/' + profileId, JSON.stringify(payload));
                defer.resolve(uploadResponse);

            }, function (err) {
                defer.reject(err);
                console.log("Inside error1");
            });

        }, function (err) {
            defer.reject(err);
            console.log("Inside error2");
        });

        return defer.promise;
    };

    obj.createProfile = function (profile) {
        return $http.post('/house/', JSON.stringify(profile));
    };
    obj.updateProfile = function(profile){
        return $http.put('/house/' + profile._id, profile);
    };
    
    obj.updateMapLink = function (profile) {
        var link = obj._mapLink;
        link += profile.address.street1 ? encodeURIComponent(profile.address.street1) : "";
        link += " ";
        link += profile.address.street2 ? encodeURIComponent(profile.address.street2) : "";
        link += ",";
        link += profile.address.city ? encodeURIComponent(profile.address.city) : "";
        link += ",";
        link += profile.address.country ? encodeURIComponent(profile.address.country) : "";
        
        return link;
    };

    return obj;
});