'use strict';

(function () {
    var BLACK = 'b';
    var WHITE = 'w';
    var EMPTY = '_';
    /*
    angular.module('WebgoFilters')
    .filter('stoneUrl', function (content) {
        if (content == EMPTY) return "images/empty.png";
        else if (content == BLACK) return "images/black.png";
        else if (content == WHITE) return "images/white.png";
    });
    angular.module('aApp', ['WebgoFilters'])
    */

    angular.module('aApp')
    .filter('stoneUrl', function () {
        return function (content) {
            if (content == EMPTY) return "images/empty.png";
            else if (content == BLACK) return "images/black.png";
            else if (content == WHITE) return "images/white.png";
        };
    })
    .controller('MainCtrl', function ($scope) {
        $scope.newAwesome = "default";
        $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
        ];
        $scope.clickMe = function (pi,i,content) {
            if (content == EMPTY) board[pi][i] = BLACK;
            else if (content == BLACK) board[pi][i] = WHITE;
            else if (content == WHITE) board[pi][i] = EMPTY;
        };
        $scope.addAwesome = function () {
            $scope.awesomeThings.push($scope.newAwesome);
            $scope.newAwesome = "";
        };

        var board = [];

        for (var i=0;i<19;i++) {

            board[i] = [];

            for (var j=0;j<19;j++) {

                board[i][j] = EMPTY;
            }

        }

        board[3][4] = BLACK;
        board[5][3] = WHITE;
        board[4][6] = BLACK;
        board[3][2] = WHITE;
        board[2][3] = BLACK;
        board[8][3] = WHITE;
        $scope.board = board;

    });
})();
