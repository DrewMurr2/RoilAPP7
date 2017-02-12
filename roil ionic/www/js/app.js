// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform, $cordovaStatusbar, $rootScope) {
    
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            //StatusBar.styleDefault();
            $cordovaStatusbar.overlaysWebView(true);
            $cordovaStatusbar.styleHex('#111111');
        }
        
        $rootScope.trackOnOff = [];
        
        /*setTimeout(function(){
            document.getElementById("start-loader").style.display = "none";
        }, 3000);*/

    });
})
.config(function($ionicConfigProvider) {
    $ionicConfigProvider.views.maxCache(0);
})
.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    
    $ionicConfigProvider.backButton.previousTitleText(false);

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  
    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'AuthCtrl'
    })

    .state('logout', {
        url: '/logout',                
        controller: 'LogoutCtrl'
    })

    .state('home', {
        url: '/home',
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
    })
    
    .state('rigs', {
        url: '/rigs',
        templateUrl: 'templates/rigs.html',
        controller: 'RigsCtrl'
    })
    
    .state('rig-details', {
        url: '/rig-details',
        templateUrl: 'templates/rig-details.html',
        controller: 'RigDetailCtrl'
    })
    
    .state('rig-live-data', {
        url: '/rig-live-data',
        templateUrl: 'templates/rig-live-data.html',
        controller: 'RigLiveDataCtrl'
    })
    
    .state('rig-overview-data', {
        url: '/rig-overview-data',
        templateUrl: 'templates/rig-overview-data.html',
        controller: 'RigOverviewDataCtrl'
    })
    
    .state('logs-historic-live', {
        url: '/logs-historic-live',
        templateUrl: 'templates/logs-historic-live.html',
        controller: 'LogsHistoricLiveCtrl'
    })
    
    .state('logs-historic-offline', {
        url: '/logs-historic-offline',
        templateUrl: 'templates/logs-historic-offline.html',
        controller: 'LogsHistoricOfflineCtrl'
    })
    
    .state('surveys', {
        url: '/surveys',
        templateUrl: 'templates/surveys.html',
        controller: 'SurveysCtrl'
    })
    
    .state('gamma-logs', {
        url: '/gamma-logs',
        templateUrl: 'templates/gamma-logs.html',
        controller: 'GammaLogsCtrl'
    })
    
    .state('wells', {
        url: '/wells',
        templateUrl: 'templates/wells.html',
        controller: 'WellsCtrl'
    })
    
    .state('chart', {
        url: '/chart',
        templateUrl: 'templates/chart.html',
        controller: 'ChartCtrl'
    })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

}).filter('underscoreless', function () {
    return function (input) {        
        return input.replace(/[_,0-9]/g, ' ');
    };
})
.constant('ERROR_CONNECTING', "Oops! an error has occurred while connecting to server. Please try later")
.constant('ERROR_OPENING', "There was an error opening this document.");
