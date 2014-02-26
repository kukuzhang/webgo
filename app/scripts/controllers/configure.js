'use strict';

angular.module('aApp')
  .controller('ConfigureCtrl', ['$scope', 'libgo', 'underscore', '$routeParams',
    'GameSocket','identity',
  function ($scope, libgo, _, $routeParams, socket, identity) {

    function action (actionId) {

      console.log(actionId);

    }

    function game2Scope() {

      var game = socket.getGame();

      if (!game) return;

      $scope.myColor = identity.myColor(game) || '';
      console.log($scope);
      console.log(game);
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

    function bIfAIsMeOrNull (a,b) {

      if (identity.isThisMe(a)) { a = null; }

      if (identity.isThisMe(b)) { b = null; }

      if (!a) { return b; }

      if (!b) { return a; }

      if (isThisMe(a)) { return b; }

      return a;

    }

      var oldBlack = game.black;
      var oldWhite = game.white;

      if ($scope.myColor === 'black') {

        game.black = identity.me();
        game.white = bIfAIsMeOrNull(game.white,game.black);
        console.log('b', game);

      } else if ($scope.myColor === 'white') {

        game.white = identity.me();
        game.black = bIfAIsMeOrNull(game.black,game.white);
        console.log('w', game);

      } else {
        console.log('x', identity.me());
      }
      config.black = game.black;
      config.white = game.white;
      if (!identity.equals(game.black,oldBlack)
          || !identity.equals(game.black,oldBlack)) changed = true;

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

    var expr = '[myColor,boardSize,komi,handicaps,timeMain,timeExtraPeriods,timeStonesPerPeriod,timePeriodLength]';
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
