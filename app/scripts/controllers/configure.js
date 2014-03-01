'use strict';

angular.module('aApp')
  .controller('ConfigureCtrl', ['$scope', 'libgo', 'underscore', '$routeParams',
    'GameSocket', 'Geometry', 'identity',
  function ($scope, libgo, _, $routeParams, socket, Geometry, identity) {

    function action (actionId) {

      console.log(actionId);

    }

    function opposite (c) { return c==='black' ? 'white' : 'black'; }

    function game2Scope() {

      var game = socket.getGame();

      if (!game) return;

	  $scope.error = null;
	  $scope.black = game.black;
	  $scope.white = game.white;
      $scope.myColor = identity.myColor(game) || '';
      $scope.opponent = game[opposite($scope.myColor)];
      $scope.boardSize = game.boardSize;
      $scope.komi = game.komi;
      $scope.handicaps = game.handicaps;
      $scope.timeMain = game.timeMain;
      $scope.timeExtraPeriods = game.timeExtraPeriods;
      $scope.timeStonesPerPeriod = game.timeStonesPerPeriod;
      $scope.timePeriodLength = game.timePeriodLength;
      $scope.blackPrisoners = game.blackPrisoners;
      $scope.whitePrisoners = game.whitePrisoners;

      if ($scope.myColor === 'black') {

        console.log('black', game.configurationOkBlack,  game.configurationOkWhite);
        $scope.accept = game.configurationOkBlack;
        $scope.opponentAccepted = game.configurationOkWhite;

      } else {

        console.log('white',  game.configurationOkWhite, game.configurationOkBlack);
        $scope.accept = game.configurationOkWhite;
        $scope.opponentAccepted = game.configurationOkBlack;

      }

    }

    function updateGame () {

      $scope.$apply( game2Scope );

    }

	function bIfAIsMeOrNull (a,b) {

        if (identity.isThisMe(a)) { a = null; }

        if (identity.isThisMe(b)) { b = null; }

        if (!a) { return b; }

        if (!b) { return a; }

        if (isThisMe(a)) { return b; }

        return a;

      }

    function reconfig (newValue,oldValue,scope) {

      $scope.otherColor = opposite($scope.myColor);
      var config = {};
      var changed = false;
      var game = socket.getGame();
      var oldBlack = game.black;
      var oldWhite = game.white;

      if (!game) { return; }

      for (var attr in configurationAttributes) {

        config[attr] = $scope[attr];

        if (config[attr] !== game[attr]) {
          console.log(attr,'=>', config[attr]);
          changed = true;
        }

      }
  
      if ($scope.myColor === 'black') {

        game.black = identity.me();
        game.white = bIfAIsMeOrNull(game.white,game.black);

      } else if ($scope.myColor === 'white') {

        game.white = identity.me();
        game.black = bIfAIsMeOrNull(game.black,game.white);

      } else {

		console.log('Not my game, not configuring.');

        return;

      }
      config.black = game.black;
      config.white = game.white;
      if (!identity.equals(game.black,oldBlack)
            || !identity.equals(game.white,oldWhite)) {
          console.log('roles changed');
          changed = true;
        }

      if (changed) {

        console.log('config =>', config);
        socket.configure(config);

      } else {

        console.log('nothing changed.');

      }

    }

    var configurationAttributes = {
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

    var expr = '[accept,myColor,boardSize,komi,handicaps,timeMain,timeExtraPeriods,timeStonesPerPeriod,timePeriodLength]';
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
    $scope.colors = [ // 'black', 'white', null ];
    {label: 'Black', value: 'black'},
      {label: 'White', value: 'white'},
      {label: 'Not playing', value: ''} ];
    $scope.komis = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5];
    $scope.handicapss = [0,2,3,4,5,6,7,8,9];
    socket.routeByGameState();
    game2Scope();

  }]);
