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

mod.controller('DrillCtrl', function ($scope, $state, $log, $window) {
    "use strict";
    $log.info("Begin SettingsCtrl");

    var settings,
        getScreenDimensions;

    settings = $state.params.settings;

    getScreenDimensions = function () {
        return {
            height : $window.innerHeight,
            width : $window.innerWidth
        };
    };
});
