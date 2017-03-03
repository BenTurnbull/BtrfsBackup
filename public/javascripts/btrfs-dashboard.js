var app = angular.module('btrfs-dashboard', []);
var socket = io.connect();

app.controller('ProgressController', function($scope){
    $scope.progress = [];

    socket.on('progress-clear', function() {
        console.log('clearing progress');
        $scope.progress = [];
        $scope.$apply();
    });

    socket.on('progress', function(data){
        console.log('progress event detected: ' + data);
        $scope.progress.push(data);
        $scope.$apply();
    });
});

app.controller('StreamsController', function ($scope, $http) {
    $scope.streams = [];

    socket.on('streams', function(data){
        console.log('stream event detected');
        setAnimation(success);
        setTimeout(function() { setAnimation(idle); }, 1500);
        $scope.streams = convertStream(data);
        $scope.$apply();
    });

    $scope.rollup = function(date) {
        console.log('rollup called for: ' + date);
        setAnimation(busy);
        $http.post('api/streams', date).success(function (data, status){
            console.log('submit rollup success: ' + status);
        }).error(function(data, status){
            console.log('submit rollup failure: ' + status);
            setAnimation(error);
            alert('error submitting rollup');
        });
    };

    var retrieveStreams = function () {
        $http.get('api/streams').success(function (data) {
            $scope.streams = convertStream(data);
        }).error(function (data, status) {
            console.log('list streams failure: ' + status);
            alert('error loading streams');
        });
    };
    retrieveStreams();
});

function convertStream(streams) {
    var convertedStreams = [];
    for	(var index = 0; index < streams.length; index++) {
        var size = bytesToSize(streams[index].size);
        convertedStreams.push({date:streams[index].date, hash:streams[index].hash, duration:streams[index].duration, size:size});
    }
    return convertedStreams;
}

function bytesToSize(sizeInBytes) {
    if (sizeInBytes > 1073741824) {
        return (sizeInBytes / 1073741824).toFixed(2) + ' GB'
    } else if (sizeInBytes > 1048576) {
        return (sizeInBytes / 1048576).toFixed(2) + ' MB'
    } else if (sizeInBytes > 1024) {
        return (sizeInBytes / 1024).toFixed(1) + ' KB'
    } else { // bytes
        return sizeInBytes + ' bytes'
    }
}

app.controller('BackupsController', function ($scope, $http) {
    $scope.machine = {};
    $scope.submit = function() {
        setAnimation(busy);
        $http.post('api/backups', $scope.machine).success(function (data, status){
            console.log('submit success: ' + status);
        }).error(function(data, status){
            console.log('submit failure: ' + status);
            setAnimation(error);
            alert('error submitting backup');
        });
    };
});

// Animation state colours
var idle = "38, 38, 38";
var busy = "115, 235, 255";
var success = "97, 217, 93";
var error = "255, 55, 38";

// Sets animation colour
function setAnimation(rgb){
    var cssRule;
    cssRule = getRule("color");
    cssRule.deleteRule('0');
    cssRule.deleteRule('1');
    cssRule.appendRule("0%, 100% { stroke: rgb(" + rgb + "); }");
}

// Returns a reference to the specified CSS rule(s).
function getRule(name) {
    var rule;
    var ss = document.styleSheets;
    for (var i = 0; i < ss.length; ++i) {
        for (var x = 0; x < ss[i].cssRules.length; ++x) {
            rule = ss[i].cssRules[x];
            if (rule.name == name && rule.type == CSSRule.KEYFRAMES_RULE) {
                return rule;
            }
        }
    }
}