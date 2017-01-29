vidom.factory('AuthSvc', function ($q, $http, $location, $window) {
    var obj = {};
    obj._sessionIsValid = false;
    obj.sessionIsValid = function () {
        return $window.localStorage.getItem('token') !== null;
    };

    obj.login = function (username, password) {
        obj._clearStorage();
        var defered = $q.defer();
        $http.post('/session', {username: username, password: password}).then(function (token) {
            defered.resolve(token);
            this._sessionIsValid = true;
        }, function (err) {
            defered.reject(err);
        });
        return defered.promise;

    };
    obj.logout = function () {
        this._sessionIsValid = false;
        obj._clearStorage();
        $location.path('/welcome');
    };
    obj.signUp = function (model) {
        obj._clearStorage();
        return $http.post('/users', JSON.stringify(model));
    };

    obj.getUser = function () {
        var defer = $q.defer();
        if ($window.localStorage.getItem('user')) {
            var user = JSON.parse($window.localStorage.getItem('user'));
            defer.resolve(user);
        }


        $http.get('/users', {headers: {'x-auth': $window.localStorage.getItem('token')}}).then(function (response) {
            $window.localStorage.setItem('user', JSON.stringify(response.data));
            defer.resolve(response.data);
        }, function (err) {
            defer.reject(err);
        });

        return defer.promise;
    };

    obj.resetPassword = function (email) {
        return $http.get('/users/password/reset/' + email);
    };
    obj.changePassword = function (username, password, isPasswordReset) {
        return $http.put('/users/password/change/', {username: username, password: password, isPasswordReset:isPasswordReset});
    };
    obj.validateResetPasswordHash = function (token) {
        return $http.get('/users/password/reset/validate/' + token);
    };
    obj._clearStorage = function () {
        $window.localStorage.removeItem('token');
        $window.localStorage.removeItem('user');
    };

    return obj;
});