(function(exports) {

  var BLACK = 'b';
  var WHITE = 'w';
  var EMPTY = '_';

  exports.BLACK = BLACK;
  exports.WHITE = WHITE;
  exports.EMPTY = EMPTY;
  exports.newGame = function (options) { return new Game(options); }

  function Game(options) {

    var defaults = {
      black : 'black', // name of the player
      white : 'white', // name of the player
      boardSize : 19,
      handicaps : 0,
      moves : []

    };

    options = options || {};

    for (var key in defaults) {
      this[key] = options[key] !== undefined ? options[key] : defaults[key];
    }

    this.boards = [new Board(this.boardSize)];  // cached boards

  }

  Game.prototype.play = function (move) {

    var newBoard = this.getBoard().play(move);
    this.moves.push(move);

    return newBoard;

  };

  Game.prototype.getBoard = function (move) {

    if (move === undefined) move = this.moves.length;

    if (move < 0) { throw new Error('Move must be a positive integer'); }

    if (this.boards[move] === undefined) {

      this.boards[move] = this.getBoard(move-1).play(this.moves[move-1]);

    }

    return this.boards[move];

  };

  function Board(boardSize,template) {

    this.stones = [];
    this.boardSize = boardSize

    for (var i=0;i<boardSize;i++) {

      this.stones[i] = [];

      for (var j=0;j<boardSize;j++) {

        this.stones[i][j] = (template === undefined) ?
                            EMPTY :
                            template[i][j];

      }

    }

  }

  Board.prototype.validCoordinate = function (row) {
    return (row >= 0 && row < this.boardSize);
  }

  Board.prototype.setStone = function (row,column,content) {

    if (!this.validCoordinate(row)) {
      throw new Error('Invalid row ' + row);
    }
    if (!this.validCoordinate(column)) {
      throw new Error('Invalid column ' + column);
    }
    this.stones[row][column] = content;

  };

  Board.prototype.getStone = function (row,column) {
    return this.stones[row][column];
  };

  Board.prototype.toString = function () {

    var rows = this.stones.map(function (row) { return row.join(' '); });

    return rows.join('\n');

  }

  Board.prototype.play = function (move) {

    function kill(row,column) {

      var opposite = move.stone === WHITE ? BLACK : WHITE;
      var groupToKill = new Group(newBoard,row,column);

      if (groupToKill.content !== opposite) { return; }

      if (groupToKill.getLiberties(newBoard) > 0) { return; }

      groupToKill.removeFromBoard(newBoard);

    }

    if (!this.validCoordinate(move.row)) {
      throw new Error('Invalid row ' + move.row);
    }
    if (!this.validCoordinate(move.column)) {
      throw new Error('Invalid column ' + move.column);
    }
    if (move.stone != WHITE && move.stone !== BLACK) {
      throw new Error('Invalid stone ' + move.stone);
    }
    if (this.getStone(move.row,move.column) !== EMPTY) {
      throw new Error('Point ' + move.row + ',' + move.column + ' not empty');
    }

    var newBoard = new Board(this.boardSize,this.stones);

    newBoard.setStone(move.row,move.column, move.stone);
    var myGroup = new Group(newBoard,move.row,move.column);
    
    kill(move.row-1, move.column);
    kill(move.row+1, move.column);
    kill(move.row, move.column-1);
    kill(move.row, move.column+1);

    if (false) {
      throw new Error('Move not possible because of ko');
    }
    if (myGroup.getLiberties(newBoard) == 0) {
      throw new Error('Suicide is not allowed');
    }

    return newBoard;


  };

  Board.prototype.point2Hash = function (row,column) {

    return row*this.boardSize + column;

  };

  Board.prototype.hash2Point = function (hash) {

    var row = Math.floor (hash / this.boardSize);
    var col = hash % this.boardSize;

    return [row,col];

  };

  // A recursive constructor, oho!
  function Group (board, row, column) {

    var hash = board.point2Hash(row,column);

    // If this is initial call, set desired point content
    if (this.content === undefined) {

      this.content = board.getStone(row,column);
      this.hashes = { };

    }

    // check that point coordinates are on board
    if (!board.validCoordinate(row) ||
      !board.validCoordinate(column)) {
      return;
    }

    // Stop recursion if this point is already in the group.
    if (this.hashes[hash] !== undefined) { return; }

    // Stop recursion if this point is not of desired content
    else if (board.getStone(row,column) != this.content) { return; }

    // Otherwise add this point to the group and recurse.
    else {

      this.hashes[hash] = true;
      Group.bind(this)(board, row + 1,column);
      Group.bind(this)(board, row - 1,column);
      Group.bind(this)(board, row,column + 1);
      Group.bind(this)(board, row,column - 1);
      
    }

  };

  Group.prototype.removeFromBoard = function (board) {

    for (var hash in this.hashes) {

      var point = board.hash2Point(hash);
      board.setStone(point[0],point[1],EMPTY);

    }

  };

  Group.prototype.getNeighbours = function (board) {

    function tryToAddToNeighbours(hashes,row,col) {

      var hash = board.point2Hash(row,col);

      if (hashes[hash] === undefined) neighbours[hash] = true;

    }
    var neighbours = {};

    for (var hash in this.hashes) {

      var point = board.hash2Point(hash);
      tryToAddToNeighbours(this.hashes,point[0]+1,point[1]);
      tryToAddToNeighbours(this.hashes,point[0]-1,point[1]);
      tryToAddToNeighbours(this.hashes,point[0],point[1]+1);
      tryToAddToNeighbours(this.hashes,point[0],point[1]-1);
    }

    return neighbours;

  };

  Group.prototype.getLiberties = function (board) {

    var neighbours = this.getNeighbours(board);
    var freedoms = Object.keys(neighbours).filter(function (hash) {
      var point = board.hash2Point(hash);
      return (board.getStone(point[0],point[1]) === EMPTY)
    });

    console.log('f',freedoms);
    return freedoms.length;

  };


})(typeof exports === 'undefined' ? this.libgo = {} : exports);
