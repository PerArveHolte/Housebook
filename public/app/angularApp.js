var vidom = angular.module('vidom', ['ngRoute', 'angular-loading-bar', 'ui.bootstrap', 'angulartics.google.analytics']);

vidom.config(function ($routeProvider, $locationProvider, cfpLoadingBarProvider, $httpProvider) {

    $httpProvider.interceptors.push('AuthHttpInterceptor');

    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.latencyThreshold = 500;
    cfpLoadingBarProvider.parentSelector = '#loading-bar-container';

    $locationProvider.html5Mode(false);

    $routeProvider
            .when('/welcome', {
                controller: 'LoginCtlr',
                templateUrl: 'partials/start.html',
                resolve: {
                    persistance:  function($location){
                        checkPersistanceStorage($location);
                    },                      
                    auth: function (AuthSvc, $rootScope, $location) {
                        revalidateSession(AuthSvc, $rootScope, $location, true);
                    }
                }
            })
            .when('/house/create', {controller: 'HouseCtlr', templateUrl: 'partials/createHouseProfile.html', resolve: {
                    auth: function (AuthSvc, $rootScope, $location) {
                        revalidateSession(AuthSvc, $rootScope, $location, false);
                    }
            }})
            .when('/house/:id/:partial?', {controller: 'HouseCtlr', templateUrl: 'partials/houseProfile.html', resolve: {
                    auth: function (AuthSvc, $rootScope, $location) {
                        revalidateSession(AuthSvc, $rootScope, $location, false);
                    }
                }})
            .when('/house', {controller: 'HouseCtlr', templateUrl: 'partials/houseSplashScreen.html', resolve: {
                    auth: function (AuthSvc, $rootScope, $location) {
                        revalidateSession(AuthSvc, $rootScope, $location, false);
                    }
                }})
            .when('/user/change-password/:token?', {controller: 'LoginCtlr', templateUrl: 'partials/forms/account/changePassword.html'})
            .when('/user/reset-password', {controller: 'HouseCtlr', templateUrl: 'partials/forms/account/resetPassword.html'})
            .when('/error/persistance', {templateUrl: 'partials/error/persistance.error.html'})
            .otherwise({redirectTo: '/welcome'});
});

vidom.run(function ($location) {
    checkPersistanceStorage($location);    
});

function revalidateSession(AuthSvc, $rootScope, $location, isWelcomePage) {
    if (AuthSvc.sessionIsValid()) {
        AuthSvc.getUser().then(function (user) {
            $rootScope.user = user;
            if (isWelcomePage) {
                if (user.createdHouseProfile && user.createdHouseProfile.length === 1) {
                    $location.path("/house/" + user.createdHouseProfile[0].ref._id);
                } else {
                    $location.path("/house");
                }
            }

        });
    }
}

function checkPersistanceStorage($location){
    try {
        localStorage.ex = 1;
        sessionStorage.ex2 = 1;
        localStorage.removeItem("ex");
        sessionStorage.removeItem("ex2");
    } catch (ex) {
        $location.path("/error/persistance");
    }
}