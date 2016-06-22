// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
/*global angular,
         cordova,
         window,
         StatusBar
*/
var app = angular.module('PressureTables', ['ionic', 'ptcontrollers', 'ptservices']);

app.run(function ($ionicPlatform) {
    "use strict";
    $ionicPlatform.ready(function () {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});


app.constant('config', {
    appName: "Pressure Tables",
    production: false,
    defaultLevel: 1,
    defaultTime: 10000,
    levelFactor: 0.8,
    headerHeight: 44,
    barWidth: 40,
    defaultFontSize: 40,
    frameLength: 10,
    answerPoints: 10
});

app.config(function (config, $logProvider) {
    "use strict";

    if (config.production) {
        $logProvider.debugEnabled(false);
    }
});


app.config(function ($stateProvider, $urlRouterProvider) {
    "use strict";

    $stateProvider
        .state('settings', {
            url: '/settings',
            templateUrl: "views/settings.html",
            controller: 'SettingsCtrl'
        })

        .state('drill', {
            url: '/drill',
            templateUrl: "views/drill.html",
            controller: 'DrillCtrl',
            params: {settings: null}
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/settings');
});
