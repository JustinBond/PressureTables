/*global angular*/
var mod = angular.module('ptcontrollers', []);

mod.controller('SettingsCtrl', function ($scope, $state, $log, config, tables) {
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
        //$state.go('drill', {settings: settings});
        tables.getQuestion(5);
    };
});

/*global document*/
mod.controller('DrillCtrl', function ($scope, $state, $log, $window, config, graphics) {
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
        var scoreboardHeight,
            answersHeight,
            mainCanvas,
            screen;

        mainCanvas = document.getElementById("mainCanvas");

        scoreboardHeight = document.getElementById("scoreboard").offsetHeight;
        answersHeight = document.getElementById("answers").offsetHeight;
        screen = getScreenDimensions();

        $log.debug("Heights: Screen " + screen.height + " - header " + config.headerHeight + " - scoreboard " + scoreboardHeight + " answers " + answersHeight);

        mainCanvas.height = screen.height - config.headerHeight - scoreboardHeight - answersHeight;
        mainCanvas.width = screen.width;


        graphics.init(mainCanvas.height, mainCanvas.width, mainCanvas.getContext("2d"));
    }());
});
