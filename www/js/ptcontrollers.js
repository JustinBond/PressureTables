/*global angular*/
var mod = angular.module('ptcontrollers', []);

mod.controller('SettingsCtrl', function ($scope, $state, $log, $ionicPopup, config) {
    "use strict";
    $log.info("Begin SettingsCtrl");

    $scope.settings = { "level" : config.defaultLevel,
                        "tables" : null
        };

    $scope.$watch('settings.tables', function () {
        $log.debug("tables changed: " + JSON.stringify($scope.settings.tables));
    });

    $scope.startDrill = function (settings) {
        $log.debug("Starting drill with settings: " + JSON.stringify(settings));
        if (settings.tables === null) {
            $ionicPopup.alert({
                title: 'No tables selected!',
                subTitle: 'Please select at least one times table to continue.'
            });
            return false;
        }
        $state.go('drill', {settings: settings});
    };
});

/*global document*/
mod.controller('DrillCtrl', function ($scope, $rootScope, $state, $log, $window, config, graphics, drillLogic, Notification) {
    "use strict";
    $log.info("Begin SettingsCtrl");

    var settings,
        getScreenDimensions,
        processTables,
        run,
        question,
        timesUpHandler;

    settings = $state.params.settings;

    $scope.level = settings.level;
    $scope.score = 0;
    $scope.answers = {
        a : "A",
        b : "B",
        c : "C",
        d : "D"
    };

    timesUpHandler = $rootScope.$on("times-up", function () {
        $log.debug("times-up handles");
        drillLogic.answer(false);
    });

    $scope.$on("$destroy", function () {
        $log.info("Ending drill");
        graphics.cancel();
    });

    $scope.$on("$destroy", timesUpHandler);

    Notification.subscribe($scope, "level-up", function () {
        $scope.level += 1;
    });

    processTables = function () {
        var table,
            tables;

        tables = [];
        for (table in settings.tables) {
            if (settings.tables.hasOwnProperty(table)) {
                switch (table) {
                case "two":
                    tables.push(2);
                    break;
                case "three":
                    tables.push(3);
                    break;
                case "four":
                    tables.push(4);
                    break;
                case "five":
                    tables.push(5);
                    break;
                case "six":
                    tables.push(6);
                    break;
                case "seven":
                    tables.push(7);
                    break;
                case "eight":
                    tables.push(8);
                    break;
                case "nine":
                    tables.push(9);
                    break;
                }
            }
        }
        $log.debug("Tables:" + JSON.stringify(tables));
        return tables;
    };

    getScreenDimensions = function () {
        return {
            height : $window.innerHeight,
            width : $window.innerWidth
        };
    };

    run = function () {
        $log.debug("Begin run()");
        drillLogic.drawScore();
        question = drillLogic.question(run);
        $scope.answers.a = question.options[0];
        $scope.answers.b = question.options[1];
        $scope.answers.c = question.options[2];
        $scope.answers.d = question.options[3];
    };

    (function () {
        $log.debug("DrillCtrl: Begin init");
        var scoreboardHeight,
            answersHeight,
            mainCanvas,
            screen,
            tables;

        // init graphics
        mainCanvas = document.getElementById("mainCanvas");

        scoreboardHeight = document.getElementById("scoreboard").offsetHeight;
        answersHeight = document.getElementById("answers").offsetHeight;
        screen = getScreenDimensions();

        $log.debug("Heights: Screen " + screen.height + " - header " + config.headerHeight + " - scoreboard " + scoreboardHeight + " answers " + answersHeight);

        mainCanvas.height = screen.height - config.headerHeight - scoreboardHeight - answersHeight;
        mainCanvas.width = screen.width;


        graphics.init(mainCanvas.height, mainCanvas.width, mainCanvas.getContext("2d"));

        // init logic
        tables = processTables();
        drillLogic.init(settings.level, tables);
        run();
    }());

    $scope.answer = function (choice) {
        $log.info("Begin $scope.answer() with option " + choice);
        if (question.options[choice] === question.answer) {
            $log.debug("Correct answer!");
            drillLogic.answer(true);
        } else {
            drillLogic.answer(false);
        }
    };
});
