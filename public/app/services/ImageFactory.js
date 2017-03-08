vidom.factory('ImageFctr', function ($q) {
    var obj = {};

    obj.prepareImageDataURIFromCanvas = function (width, height, imgSrc, canvasId) {
        var defer = $q.defer();
        var uri = null;
        console.log("CanvasId is: "+canvasId);
        var canvas = canvasId ? document.getElementById(canvasId) : document.createElement("canvas");
        console.log("Inside prepareImageDataURIFromCanvas. canvas is: "+canvas);
        var ctx = canvas.getContext("2d");
        var img = new Image();
        img.crossorigin = 'Anonymous';
        img.onload = function () {
            var W = img.width;
            var H = img.height;
            canvas.width = W;
            canvas.height = H;

            ctx.drawImage(img, 0, 0);
            uri = resample_single(canvas, width, height, true, true);
            defer.resolve(uri);
        };

        img.src = imgSrc;

        return defer.promise;

    };

    return obj;
});