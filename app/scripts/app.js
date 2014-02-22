'use strict';

angular.module('aApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
])
  .factory('socketio',function () {
    return window.io;
  })
  .factory('jquery',function () {
    return window.$;
  })
  .factory('underscore',function () {
    return window._;
  })
  .factory('libgo',function () {
    return window.libgo;
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/new', {
        templateUrl: 'views/newgame.html',
        controller: 'NewGameCtrl'
      })
      .when('/game/:gameId', {
        templateUrl: 'views/game.html',
        controller: 'GameCtrl'
      })
      .when('/game/:gameId/configure', {
        templateUrl: 'views/configure.html',
        controller: 'ConfigureCtrl'
      })
      .when('/game/:gameId/score', {
        templateUrl: 'views/score.html',
        controller: 'ScoreCtrl'
      })
      .when('/game/:gameId/play', {
        templateUrl: 'views/game.html',
        controller: 'GameCtrl'
      })
      .when('/game/:gameId/browse/:moveIndex', {
        templateUrl: 'views/game.html',
        controller: 'BrowserCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
