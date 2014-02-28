'use strict';

angular.module('aApp')
  .controller('GameCtrl', ['$scope', '$routeParams', 'libgo',
          'underscore', 'GameSocket', 'stones2Scope', 'Geometry', 'identity', '$rootScope',
  function ($scope, $routeParams, libgo, _, socket, stones2Scope, Geometry, identity, $rootScope) {

    function action (actionId) { apiPlay({type:actionId}); }

    function setTimings() {

      var interval;
      var game = socket.getGame();

      if (game) {

        var remBlack = game.remainingMilliSeconds(libgo.BLACK);
        var remWhite = game.remainingMilliSeconds(libgo.WHITE);
        interval = (game.getTurn() === libgo.BLACK ? remBlack : remWhite) % 1000;
        $scope.blackTime = Math.floor(remBlack / 1000);
        $scope.whiteTime = Math.floor(remWhite / 1000);

      }

      if (!interval) {interval = 1000;}

      setTimeout(function () {$scope.$apply(function() {setTimings();});}, interval);

    }

    function setTurn(turn) {

      $scope.turn = turn;
      console.log('turn',turn);
      $scope.blackTurn = turn === libgo.BLACK;
      $scope.whiteTurn = turn === libgo.WHITE;

    }

    function play2Point(row,column) { apiPlay({row:row,column:column}); }

    function game2Scope () {

      var game = socket.getGame();
      if (!game) return;
      var state = game.getState();
      setTurn(state.turn);
      $scope.white = game.white;
      $scope.black = game.black;
      $scope.boardSize = game.boardSize;
      $scope.komi = game.komi;
      $scope.handicaps = game.handicaps;
      $scope.timeMain = game.timeMain;
      $scope.timeExtraPeriods = game.timeExtraPeriods;
      $scope.timeStonesPerPeriod = game.timeStonesPerPeriod;
      $scope.timePeriodLength = game.timePeriodLength;
      $scope.blackPrisoners = game.blackPrisoners;
      $scope.whitePrisoners = game.whitePrisoners;
      stones2Scope($scope,game.getBoard());

    }

    function updateGame () {

      var d1 = new Date();
      $scope.$apply(game2Scope);
      var d2 = new Date();
      console.log ((d2-d1), 'milliseconds applying game2scope');

    }

    function updateByEvent (data) {

      var game = socket.getGame();

      if (data.type !== 'move') {

        console.log('not handling event', data.type);

        return;

      }

      if (data.index === game.moves.length) {

        var move = libgo.newMove(data.move);
        socket.getGame().play(move);
        $scope.$apply(game2Scope);

      } else {

        console.log(game.moves);
        console.log('Moves not in sync???');
        socket.requestGame();
        socket.routeByGameState();

      }

    }

    function apiPlay(options) {

      var move = _.extend({
        stone: $scope.turn,
        type: 'stone'
      },options);
      if (!move.stone) { throw new Error('Invalid stone',move.stone); }
      socket.move(move);
      setTurn(null);

    }

    function hoverIn (row,column) {

      var game = socket.getGame();

      if (!$scope.turn ||
        (game.myColor($scope.user) !== $scope.turn)) { return; }

      var obj = {timestamp: new Date().getTime(), type:'stone',stone:$scope.turn,row:row,column:column};
      var move = libgo.newMove(obj);
      var canPlay = game.isMoveOk(move);
      
      if (canPlay) {

        $scope.stones[row][column] = ($scope.turn === libgo.WHITE) ?
          libgo.WHITE_HOVER: libgo.BLACK_HOVER;

      }

    }

    function hoverOut(row,column) {

      var game = socket.getGame();
      $scope.stones[row][column] = game.getBoard().getStone(row,column);

    }

    var listeners = {
      'game': updateGame,
      'event':updateByEvent,
      //'message': null.
    };
    socket.connectTo($routeParams.gameId);
    for (var ev in listeners) { socket.on(ev,listeners[ev]); }

    $scope.$on('destroy', function() {
      for (var ev in listeners) { socket.off(ev,listeners[ev]); }
    });

	$rootScope.$watch('boardPixels', function () {

		var cells = ($scope.boardSize || 19) + 2;
		$scope.stoneSize = Math.floor($scope.boardPixels / cells);
		console.log('newSize',$scope.boardPixels, $scope.boardSize, $scope.stoneSize);
		
	});
    socket.routeByGameState();
    setTurn(null);
    setTimings();
    $scope.showCoords = false;
    $scope.hover = hoverIn;
    $scope.hoverOut = hoverOut;
    $scope.action = action;
    $scope.clickAction = play2Point;
    $scope.actions = [
      {name:'pass',label:'Pass'},
      {name:'resign',label:'Resign'}
    ];
    game2Scope();

  }]);
