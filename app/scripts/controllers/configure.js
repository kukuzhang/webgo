'use strict';

angular.module('aApp')
  .controller('ConfigureCtrl', ['$scope', 'libgo', 'underscore', '$routeParams', 'GameSocket',
  function ($scope, libgo, _, $routeParams, socket) {

    function action (actionId) {

      console.log(actionId);

    }

    function game2Scope() {

      var game = socket.getGame();

      if (!game) return;

      $scope.white = game.white;
      $scope.black = game.black;
      $scope.boardSize = game.boardSize;
      $scope.komi = game.komi;
      $scope.handicaps = game.handicaps;
      $scope.timeMain = game.timeMain;
      $scope.timeExtraPeriods = game.timeExtraPeriods;
      $scope.timeStonesPerPeriod = game.timeStonesPerPeriod;
      $scope.timePeriodLength = game.timePeriodLength;
      $scope.configurationOkBlack = game.configurationOkBlack;
      $scope.configurationOkWhite = game.configurationOkWhite;
      $scope.blackPrisoners = game.blackPrisoners;
      $scope.whitePrisoners = game.whitePrisoners;

    }

    function updateGame () {

      $scope.$apply( game2Scope );

    }

    function reconfig (newValue,oldValue,scope,forceConfigure) {

      var config = {};
      var changed = forceConfigure ? true : false;
      var game = socket.getGame();

      if (!game) { return; }

      for (var attr in configurationAttributes) {

        config[attr] = $scope[attr];

        if (config[attr] !== game[attr]) {
          changed = true;
        }

      }

      config.accept = $scope.accept;

      if (changed) {

        socket.configure(config);

      } else {

        console.log('nothing changed.');

      }

    }

    $scope.acceptConfiguration = function () {

      console.log('accepting');
      $scope.accept = $scope.accept ? false : true;
      reconfig(null,null,null,true);

    };

    var configurationAttributes = {
      'white':1,
      'black':1,
      'boardSize':1,
      'komi':1,
      'handicaps':1,
      'timeMain':1,
      'timeExtraPeriods':1,
      'timeStonesPerPeriod':1,
      'timePeriodLength':1,
      'accept':1
    };

    var listeners = {
      'game': updateGame,
      //'message': null.
    };

    var expr = '[white,black,boardSize,komi,handicaps,timeMain,timeExtraPeriods,timeStonesPerPeriod,timePeriodLength]';
    $scope.$watchCollection(expr,reconfig);
    var auth = $routeParams.auth || 'black:123';
    var parts = auth.split(':');
    $scope.username = parts[0];
    socket.connectTo($routeParams.gameId,parts[0],parts[1]);

    for (var ev in listeners) { socket.on(ev,listeners[ev]); }

    $scope.$on('destroy', function() {
      for (var ev in listeners) { socket.off(ev,listeners[ev]); }
    });

    $scope.action = action;
    $scope.actions = [];
    $scope.komis = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5];
    $scope.handicapss = [0,2,3,4,5,6,7,8,9];
    socket.routeByGameState();
    game2Scope();

  }]);
