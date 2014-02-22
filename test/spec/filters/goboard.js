'use strict';

describe('Filter: stoneCount', function () {

  var libgoMock = {
    EMPTY: 0,
    BLACK: 1,
    WHITE: 2,
    BLACK_HOVER: 3,
    WHITE_HOVER: 4,
    BLACK_POINT: 5,
    WHITE_POINT: 6,
    BLACK_DEAD: 7,
    WHITE_DEAD: 8,
  };

  // load the filter's module
  beforeEach(module('aApp'));

  // initialize a new instance of the filter before each test
  var stoneCount;

  beforeEach(module(function ($provide) {
    $provide.value('libgo', libgoMock);
  }));

  beforeEach(inject(function ($filter) {
    stoneCount = $filter('stoneCount');
    console.log(stoneCount);
  }));

  it('should return 0 for null board.', function () {
    expect(stoneCount(null)).toBe(0);
  });

  it('should return 7 for board with 7 stones on it.', function () {
    
    var board = [];
    for (var i=0; i < 19; i++) {
      board[i] = [];
      for (var j=0; j < 19; j++) {
        board[i][j] = '_';
      }
    }
    board[3][4] = 'b';
    board[5][4] = 'w';
    board[6][3] = 'b';
    board[2][14] = 'w';
    board[4][14] = 'b';
    board[7][14] = 'w';
    board[8][14] = 'b';
    expect(stoneCount(board)).toBe(0);
  });

});
