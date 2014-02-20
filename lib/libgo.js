(function(exports) {

  var BLACK = 'b';
  var WHITE = 'w';
  var EMPTY = '_';
  var BLACK_POINT = 'b+';
  var WHITE_POINT = 'w+';
  var BLACK_DEAD = 'b-';
  var WHITE_DEAD = 'w-';

  var PLAY = 'play';
  var PASS = 'pass';
  var RESIGN = 'resign';

  exports.PLAY = PLAY;
  exports.PASS = PASS;
  exports.RESIGN = RESIGN;
  exports.BLACK_POINT = BLACK_POINT;
  exports.WHITE_POINT = WHITE_POINT;
  exports.BLACK_DEAD = BLACK_DEAD;
  exports.WHITE_DEAD = WHITE_DEAD;
  exports.WHITE = WHITE;
  exports.BLACK = BLACK;
  exports.WHITE = WHITE;
  exports.EMPTY = EMPTY;
  exports.BLACK_HOVER = 'B';
  exports.WHITE_HOVER = 'W';

  exports.longColor = function (c) {

    return c == BLACK ? 'black' :
           c == WHITE ? 'white' : null;

  };

  exports.newGame = function (options) { return new Game(options); }

  function opposite(color) { return color == WHITE ? BLACK : WHITE; }

  Move.moveTypes = {
    'pass': Pass,
    'resign': Resign,
    'stone': Stone
  };

  Move.fromObject = function (obj) {

    var Cls = Move.moveTypes[obj.type];

    if (!Cls) { throw new Error('Invalid move type ' + options.type); }

    return new Cls(obj);

  };

  Move.fromString = function (json) { return Move.fromObject(JSON.parse(json)); };

  Move.prototype.toString = function () { return JSON.stringify(this); };

  function Move(options) {

    if (options.stone === BLACK) { this.stone = BLACK; }

    else if (options.stone === WHITE) { this.stone = WHITE; }

    else { throw new Error ('Invalid stone ' + options.stone); }

    this.type = options.type;
    this.timestamp = options.timestamp; // TODO: sanity check

  }

  function Pass(options) {

    Move.bind(this)(options);

  }

  Pass.prototype.__proto__ = Move.prototype;

  function Resign(options) {

    Move.bind(this)(options);

  }

  Resign.prototype.__proto__ = Move.prototype;

  function Stone(options) {

    Move.bind(this)(options);
    this.row = parseInt(options.row);
    this.column = parseInt(options.column);

  }

  Stone.prototype.__proto__ = Move.prototype;

  function Player (color,name,timing) {

    // TODO: sanity check
    this.color = color;
    this.name = name;
    this.timing = timing;

  }

  Player.prototype.isMyTurn = function(turn) { return this.color == turn; }

  function Game(options) {

    var defaults = {
      black : 'black', // name of the player
      white : 'white', // name of the player
      boardSize : 19,
      handicaps : 0,
      started : null,
      timing : {
        main : 3600, // seconds
        extraPeriods : 3, // number of byo-yomi periods
        periodLength : 60, // byo-yomi period length
        stonesPerPeriod : 1 // number of stones to be played per byo-yomi.
      },
      scoring : {},
      moves : []

    };

    options = options || {};

    for (var key in defaults) {
      this[key] = options[key] !== undefined ? options[key] : defaults[key];
    }

    this.moves = this.moves.map(function (m) {
      return Move.fromObject(m);
    });
    this.boards = [new Board(this.boardSize)];  // cached boards
    var black = typeof this.black == "object" ? this.black.name : this.black;
    this.black = new Player(BLACK,black,this.timing);
    var white = typeof this.white == "object" ? this.white.name : this.white;
    this.white = new Player(WHITE,white,this.timing);

  }

  Game.prototype.totalPlayTime = function (color) {

    var played = 0;
    var turnStarted = this.started;
    var nowPlaying = (this.handicaps > 0) ? WHITE : BLACK;

    for (var i = 0; i < this.moves.length; i++) {

      var move = this.moves[i];

      if (nowPlaying === color) { played += move.timestamp - turnStarted; }

      nowPlaying = opposite(nowPlaying);
      turnStarted = move.timestamp;

    }


    //console.log(turnStarted,new Date().getTime());
    if (nowPlaying === color) { played += new Date().getTime() - turnStarted; }

    return played;

  }

  Game.prototype.remainingMilliSeconds = function (color) {

    var total = this.totalPlayTime(color)

    return (this.timing.main * 1000) - total;

  }

  Game.prototype.getTurn = function () {

    var moves = this.moves.length;
    var whoplays = (((this.handicaps > 0) ? 1 : 0) + moves) % 2;

    return (whoplays == 0) ? BLACK : WHITE;

  }

  Game.prototype.assertMoveSanity = function (move) {

    if (!(move instanceof Move)) {
      throw new Error ('You must play only Move objects');
    }

    if (this.getTurn() !== move.stone) {
      throw new Error ('Not possible to play ' + move.stone + ' now.');
    }

  };

  Game.prototype.myColor = function (username) {

    if (!username) null;

    if (username == this.black.name) { return BLACK; }

    if (username == this.white.name) { return WHITE; }

    return null;

  };

  Game.prototype.isMoveOk = function (move) {

    try {

      this.assertMoveSanity(move);
      var newBoard = this.getBoard().playStone(move);

    } catch (e) {

      return false;

    }

    return true;

  };

  Game.prototype.play = function (move) {

    this.assertMoveSanity(move);
    var newBoard = this.getBoard().playStone(move);
    this.moves.push(move);
    var m = this.moves[this.moves.length-1];
    this.boards.push(newBoard);

    return newBoard;

  };

  Game.prototype.getState = function () {

    var moves = this.moves.length;
    var lastMove = moves > 0 ? this.moves[moves-1] : null;
    var last2Move = moves > 1 ? this.moves[moves-2] : null;
    var twoPasses = moves > 1 && lastMove.type == PASS && last2Move.type == PASS;
    var resign = moves > 0 && lastMove.type == RESIGN;
    var scored = this.scoring.whiteAgree && this.scoring.blackAgree;

    if (twoPasses && scored) { return { state: 'end', winner: scored.winner }; }
    if (twoPasses && !scored) { return { state: 'scoring'}; }
    if (scored) { return { state: 'end', winner: 'x' }; }
    if (resign) { return { state: 'end', winner: opposite(lastMove.stone) }; }
    if (this.started) { return {state: 'playing', turn: this.getTurn()}; }

    return {state: 'configuring'};

  };

  Game.prototype.getTurn = function () {

    var moves = this.moves.length;
    var whoplays = (((this.handicaps > 0) ? 1 : 0) + moves) % 2;

    return (whoplays == 0) ? BLACK : WHITE;

  }

  Game.prototype.getBoard = function (moveNumber) {

    if (moveNumber === undefined) moveNumber = this.moves.length;

    if (moveNumber < 0) {

      throw new Error('Move number must be a positive integer');

    }

    if (this.boards[moveNumber] === undefined) {

      var lastMove = this.moves[moveNumber-1];
      this.boards[moveNumber] = this.getBoard(moveNumber-1).playStone(lastMove);

    }

    return this.boards[moveNumber];

  };

  Game.prototype.isPrisoner = function (row,column) {

    var scorePoint = this.scoring.points[row][column] 

    return scorePoint == BLACK_DEAD || scorePoint == WHITE_DEAD;

  };

  Game.prototype.markOrUnmarkAsPrisoner = function (row,column) {

    var board = this.getBoard();
    var prisonerColor = board.getStone(row,column);
    var group = board.createPrisonerGroup(row,column,prisonerColor);

    if (prisonerColor === EMPTY) return null;

    if (this.isPrisoner(row,column)) {
      
      for (var hash in group.hashes) {

        var point = board.hash2Point(hash);
        this.scoring.points[point[0]][point[1]] = null;

      }
      
      for (var hash in group.hashes) {

        var point = board.hash2Point(hash);
        possiblyScorePoint(point[0],point[1],board,this.scoring.points);

      }
      
    } else {

      for (var hash in group.hashes) {

        var point = board.hash2Point(hash);
        var containsPrisoner = board.getStoneByHash(hash) != EMPTY;
        this.scoring.points[point[0]][point[1]] =
          group.owner === BLACK && !containsPrisoner ? BLACK_POINT :
          group.owner === WHITE && !containsPrisoner ? WHITE_POINT :
          group.owner === BLACK &&  containsPrisoner ? WHITE_DEAD :
          group.owner === WHITE &&  containsPrisoner ? BLACK_DEAD : null;

      }

    }

    return group

  };

  Game.prototype.scorePoint = function (row,column) {

    if (this.scoring.points) return this.scoring.points[row][column];

    else return null;

  };

  function Board(boardSize,template) {

    this.stones = [];
    this.length = boardSize

    for (var i=0;i<boardSize;i++) {

      this.stones[i] = [];

      for (var j=0;j<boardSize;j++) {

        this.stones[i][j] = (!template) ?
                            EMPTY :
                            template[i][j];

      }

    }

  }

  Game.prototype.getInitialScoring = function () {

    var points = []
    var board = this.getBoard();

    for (var i=0;i<board.length;i++) {

      points[i] = [];

      for (var j=0;j<board.length;j++) {
        
        points[i][j] = null;

      }

    }

    for (var i=0;i<board.length;i++) {

      for (var j=0;j<board.length;j++) {

        possiblyScorePoint(i,j,board,points);

      }

    }

    this.scoring.points = points;

    return points;

  };

  Board.prototype.validCoordinate = function (row) {
    return (row >= 0 && row < this.length);
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

  Board.prototype.getStoneByHash = function (hash) {

    if (hash === null) { return null; }
    var coords = this.hash2Point(hash);

    if (this.validCoordinate(coords[0]) && this.validCoordinate(coords[1])) {

      return this.getStone(coords[0],coords[1]);

    }

    return null;

  };

  Board.prototype.getStone = function (row,column) {

    return this.stones[row][column];

  };

  Board.prototype.toString = function () {

    var rows = this.stones.map(function (row) { return row.join(' '); });

    return rows.join('\n');

  }

  Board.prototype.isMoveOnBoard = function (move) {

    return this.validCoordinate(move.row) &&
           this.validCoordinate(move.column);

  }

  Board.prototype.playStone = function (move) {

    function kill(board,row,column) {

      if (!board.validCoordinate(row) || !board.validCoordinate(column)) {
        return;
      }

      var groupToKill = newBoard.createGroup(row,column,opposite(move.stone));

      if (!groupToKill) { return; }

      if (groupToKill.getLiberties(newBoard) > 0) { return; }

      groupToKill.removeFromBoard(newBoard);

    }

    var newBoard = new Board(this.length,this.stones);

    if (move.type === 'pass' || move.type === 'resign') { return newBoard; }

    if (!this.isMoveOnBoard(move)) {
      throw new Error('Move is not on board: ' + move.row + ',' + move.column);
    }

    if (this.getStone(move.row,move.column) !== EMPTY) {
      throw new Error('Point ' + move.row + ',' + move.column + ' not empty');
    }


    newBoard.setStone(move.row,move.column, move.stone);
    var myGroup = newBoard.createGroup(move.row,move.column,move.stone);
    
    kill(this, move.row-1, move.column);
    kill(this, move.row+1, move.column);
    kill(this, move.row, move.column-1);
    kill(this, move.row, move.column+1);

    if (false) {
      throw new Error('Move not possible because of ko');
    }
    if (myGroup.getLiberties(newBoard) == 0) {
      throw new Error('Suicide is not allowed');
    }

    return newBoard;


  };

  Board.prototype.point2Hash = function (row,column) {

    return row*this.length + column;

  };

  Board.prototype.hash2Point = function (hash) {

    var row = Math.floor (hash / this.length);
    var column = hash % this.length;

    return [row,column];

  };

  Board.prototype.createScoringGroup = function (row,column,prisoners) {
    var g = new Group(this,row,column);
    var neighbours = g.getNeighbours(this);
    var board = this;
    var surroundedBy = this.getStoneByHash(Object.keys(neighbours).reduce(function (prev,cur) {

      var pStone = board.getStoneByHash(prev);
      var cStone = board.getStoneByHash(cur);

      return pStone === cStone ? prev : null;

    }));

    g.owner = surroundedBy;

    return g;
  };

  Board.prototype.createGroup = function (row,column,content) {
    return new Group(this,row,column);
  };

  Board.prototype.createPrisonerGroup = function (row,column,prisonerColor) {

    var g = new Group(this,row,column,prisonerColor);
    console.log(g.getNeighbours(this),prisonerColor);
    g.owner = opposite(prisonerColor);

    return g;

  };

  // A recursive constructor, oho!
  function Group (board, row, column, prisonerColor) {

    // check that point coordinates are on board
    if (!board.validCoordinate(row) || !board.validCoordinate(column)) { return; }

    var hash = board.point2Hash(row,column)
    var stone = board.getStone(row,column);

    // If this is initial call, set desired point content
    if (this.content === undefined) {

      if (prisonerColor) {

        this.content = EMPTY;
        this.prisonerColor = prisonerColor;

      } else {

        this.content = stone;

      }

      this.hashes = { };

    }

    // Stop recursion if this point is already in the group.
    if (this.hashes[hash] !== undefined) { return; }

    // Stop recursion if this point is not of desired content
    else if (stone != this.content && stone != this.prisonerColor) { return; }

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

    function tryToAddToNeighbours(hashes,row,column) {

      var hash = board.point2Hash(row,column);

      if (hashes[hash] === undefined &&
          board.validCoordinate(row) &&
          board.validCoordinate(column)) {

        neighbours[hash] = true;

      }

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

    return freedoms.length;

  };

  exports.newBoard = function (s,t) { return new Board(s,t); };
  exports.newMove = Move.fromObject;
  exports.json2Move = Move.fromString;
  
  function possiblyScorePoint (i,j,board,points) {

    if (board.stones[i][j] !== EMPTY || points[i][j] !== null) { return; }

    var group = board.createScoringGroup(i,j);

    for (var hash in group.hashes) {

      var point = board.hash2Point(hash);

      points[point[0]][point[1]] = group.owner == BLACK ? BLACK_POINT :
                                    group.owner == WHITE ? WHITE_POINT : EMPTY;

    }

  }


})(typeof exports === 'undefined' ? this.libgo = {} : exports);
