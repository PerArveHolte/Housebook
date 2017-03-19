'use strict';

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

    //2017-03-01 Guri added number value "pictureNo", where 0 - 9 are reserved for the 0 - 9 pictures. The profile picture has value -1.
    obj.savePicture = function (profileId, name, type, file, isThumbnail, pictureNo, createdBy) {

        var defer = $q.defer();
        var data = {profileId: profileId, fileName: name, fileType: file.type}; //2017-02-19 Guri: The file.type variable seems to be empty.
        
        /* Guri's assumption: Gets the address from S3 where the image shall be put 
         * Guri thinks the statement "url: '/aws/sign-s3'" refers to file api/aws.js, function router.get('/sign-s3' [...])*/
        $http({
            method: 'GET',
            url: '/aws/sign-s3',
            params: data
        }).then(function (response) {
            
            /* Guri's assumption: Puts image into s3 bucket */
            $http({
                method: 'PUT',
                url: response.data.signedRequest,
                data: file,
                headers: {'Content-type': file.type}
            }).then(function (uploadResponse) {

                //Upload information into the "payload" variable to send it to the house.js file for further processing
                var payload = {fileName: name, contentType: type, isThumbnail: isThumbnail, pictureNumber: pictureNo, userId: createdBy};
              
                // The statement "$http.post('/house/' + profileId [...]" refers to file api/house.js, function router.post('/:profileId', [...])
                $http.post('/house/' + profileId, JSON.stringify(payload));
                defer.resolve(uploadResponse);

            }, function (err) {
                defer.reject(err);
            });

        }, function (err) {
            defer.reject(err);
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