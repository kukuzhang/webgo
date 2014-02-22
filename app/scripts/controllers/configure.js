'use strict';

angular.module('aApp')
  .controller('ConfigureCtrl', ['$scope', '$routeParams', 'libgo',
          'underscore', 'Socket', '$location',
  function ($scope, $routeParams, libgo, _, socket, $location) {

    function action (actionId) {

      if (actionId === 'done') { emitScoring(true); }

      else if (actionId === 'back-to-game') { backToGame(); }

      else { apiPlay({type:actionId}); }

    }

    function backToGame() {

    }

    function game2Scope () {

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

    function routeByGameState(state) {

      console.log('state now',state.state);
      
      if (state.state !== 'configure') {

        $location.path('/game/' + $routeParams.gameId);

      }

    }

    function updateGame (data) {

      console.log('received game', data);
      game = libgo.newGame(data);
      routeByGameState(game.getState());
      $scope.error = null;
      $scope.$apply(game2Scope);

    }

    function updateByError (data) {

      $scope.error = data;
      $scope.$apply(game2Scope);

    }

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
      'error':updateByError,
      'connect_failed':setConnectionStatus,
      'connect':setConnectionStatus,
      'disconnect':setConnectionStatus,
      'connecting': setConnectionStatus,
      'reconnect_failed': setConnectionStatus,
      'reconnect': setConnectionStatus,
      'reconnecting': setConnectionStatus,
      //'error': null,
      //'message': null.
    };

    for (var ev in listeners) { socket.on(ev,listeners[ev]); }

    $scope.$on('destroy', function() {
      for (var ev in listeners) { socket.off(ev,listeners[ev]); }
    });

    internalSetConnectionStatus();

    function setConnectionStatus() {

      console.log('set c',socket.isConnected(),socket.getConnectionStatus());
      $scope.$apply(internalSetConnectionStatus);

    }

    function internalSetConnectionStatus () {

      $scope.connection = socket.getConnectionStatus();
      $scope.username = socket.getUserName();

      if (socket.isConnected()) {

        console.log('=> refresh game', $routeParams.gameId);
        socket.emit('game', $routeParams.gameId);

      }
    }

    var game = null;
    $scope.action = action;
    $scope.actions = [];
    $scope.komis = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5];
    $scope.handicapss = [0,2,3,4,5,6,7,8,9];

    function reconfig (newValue,oldValue,scope,forceConfigure) {

      var ev = { type : 'configure', gameId : $routeParams.gameId };
      var changed = forceConfigure ? true : false;

      if (!game) { return; }

      for (var attr in configurationAttributes) {

        ev[attr] = $scope[attr];

        if (ev[attr] != game[attr]) {
          changed = true;
        }

      }

      ev.accept = $scope.accept;

      if (changed) {

        console.log('configure', ev);
        socket.emit('configure', ev);

      } else {

        console.log('nothing changed.');

      }

    }

    $scope.acceptConfiguration = function () {

      console.log('accepting');
      $scope.accept = $scope.accept ? false : true;
      reconfig(null,null,null,true);

    };

    var expr = '[white,black,boardSize,komi,handicaps,timeMain,timeExtraPeriods,timeStonesPerPeriod,timePeriodLength]';
    $scope.$watchCollection(expr,reconfig);

  }]);
