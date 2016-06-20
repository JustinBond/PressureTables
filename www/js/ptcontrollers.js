/*global angular*/
var mod = angular.module('ptcontrollers', []);

mod.controller('SettingsCtrl', function ($scope, $state, $log, config) {
    "use strict";
    $log.info("Begin SettingsCtrl");

    $scope.settings = { "level" : config.defaultLevel,
                        "tables" : null
        };

    $scope.$watch('settings.tables', function () {
        $log.debug("tables changed: " + JSON.stringify($scope.settings.tables));
    });

    $scope.startDrill = function (settings) {
        $log.debug("Starting drill with settings: ", JSON.stringify(settings));
        $state.go('drill', {settings: settings});
    };
});

/*global document*/
mod.controller('DrillCtrl', function ($scope, $state, $log, $window, config) {
    "use strict";
    $log.info("Begin SettingsCtrl");

    var settings,
        getScreenDimensions;

    settings = $state.params.settings;

    $scope.level = settings.level;
    $scope.score = 0;

    getScreenDimensions = function () {
        return {
            height : $window.innerHeight,
            width : $window.innerWidth
        };
    };

    (function () {
        $log.debug("DrillCtrl: Begin init");
        var controlsHeight,
            canvas,
            screen;

        canvas = document.getElementById("myCanvas");
        controlsHeight = document.getElementById("scoreboard").offsetHeight + config.headerHeight;
        screen = getScreenDimensions();

        canvas.height = screen.height - controlsHeight;
        canvas.width = screen.width;

        //graphics.init(canvas.height, canvas.width, canvas.getContext("2d"));
    }());
});
