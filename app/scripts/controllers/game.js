'use strict';

angular.module('aApp')
  .controller('GameCtrl', ['$scope', '$routeParams', 'libgo',
  function ($scope, $routeParams, libgo) {

    function game2Scope () {

      $scope.turn = game.getTurn();
      $scope.stones = game.getBoard().stones;
      $scope.black = {
        name: game.black.name,
        timing: game.black.timing,
        color: 'black',
        turn: $scope.turn === libgo.BLACK
      };
      $scope.white = {
        name: game.white.name,
        timing: game.white.timing,
        color: 'white',
        turn: $scope.turn === libgo.WHITE
      };
      console.log('Last move: ', game.moves[game.moves.length - 1]);
      console.log('Turn: ', $scope.turn);
      var board = game.getBoard();
      $scope.stones = board.stones.map(function (row) {
        return row.map(function(col) { return col; });
      });

    }

    function updateGame (data) {

      console.log('received game', data);
      game = libgo.newGame(data);
      $scope.$apply(game2Scope);

    }

    function updateByEvent (data) {

      console.log('received move', data);
      if (data.index === game.moves.length) {

        var move = libgo.json2Move(data.move);
        game.play(move);
        $scope.$apply(game2Scope);

      } else {

        console.log(game.moves);
        console.log('Moves not in sync???');
        socket.emit('game', $routeParams.gameId);

      }

    }

    function apiPlay(options) {

      var move = _.extend({
        stone: $scope.turn,
        type: 'stone'
      },options);
      console.log('move',move);
      socket.emit('move',move);

    }

    function hoverIn (row,column) {

      var json = {type:'stone',stone:$scope.turn,row:row,column:column};
      var move = libgo.json2Move(json);
      var canPlay = game.isMoveOk(move);
      
      if (canPlay) {

        $scope.stones[row][column] = ($scope.turn === libgo.WHITE) ?
          libgo.WHITE_HOVER: libgo.BLACK_HOVER;

      }

    }

    function hoverOut(row,column) {

      $scope.stones[row][column] = game.getBoard().stones[row][column];

    }

    //var newGameStream = Bacon.fromPromise(wre);
    var game = libgo.newGame();
    game2Scope();
    $scope.showCoords = true;

    var socket = io.connect('http://localhost:3000/');
    console.log('initial get');
    window.s = socket;
    socket.on('moi', function (m) {console.log(':'+m);socket.emit('game', $routeParams.gameId);});
    socket.emit('game', $routeParams.gameId);
    socket.on('game', updateGame);
    socket.on('event',updateByEvent);

    $scope.hover = hoverIn;
    $scope.hoverOut = hoverOut;
    $scope.pass = function () { apiPlay({type:'pass'}); };
    $scope.resign = function () { apiPlay({type:'resign'}); };
    $scope.play = function (row,column) { apiPlay({row:row,column:column}); };

  }]);
