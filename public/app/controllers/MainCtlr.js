vidom.controller('MainCtlr', function ($scope, $location, AuthSvc) {
    $scope.formSent = false;
    $scope.success = true;

    $scope.initContactForm = function () {
        _.defer(function () {
            $scope.formSent = false;
            $("form[name='contactForm']").trigger("reset");
            $scope.$apply();
            $('#modal-feedback').modal('show');
        });
    };

    $scope.sentMail = function (email, message, type) {
        $.ajax({
            url: "/mail",
            method: "POST",
            data: {content: message, subject: "New contact form pilot application", replyTo: email, type:type},
            dataType: "json"
        }).then(function () {
            _.defer(function () {
                $scope.$apply();
            });
        });
        $scope.formSent = true;
    };
    $scope.goToResetPasswordForm = function () {
        $("#login-dp-toggle").dropdown("toggle");
        $location.path('/user/reset-password');
    };
    $scope.resetPassword = function (email) {
        $scope.success = true;
        $scope.formSent = true;
        AuthSvc.resetPassword(email).then(function (response) {
            console.log(response.data);
        }, function (err) {
            $scope.resetPasswordErrorMsg = err;
            $scope.success = false;
        });
    };
});