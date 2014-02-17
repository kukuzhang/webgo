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
      .otherwise({
        redirectTo: '/'
      });
  });
