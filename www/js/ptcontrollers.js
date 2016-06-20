/*global angular*/
var mod = angular.module('ptcontrollers', []);

mod.controller('SettingsCtrl', function ($scope, $log, config) {
    "use strict";
    $log.info("Begin SettingsCtrl");

    var levelToName;

    $scope.settings = { "level" : config.defaultLevel,
                        "tables" : ["six"]
        };

});

mod.controller('DrillCtrl', function ($scope, $log) {
    "use strict";
    $log.info("Begin SettingsCtrl");
});
