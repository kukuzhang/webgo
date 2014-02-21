(function(exports) {

  var BLACK = 'b';
  var WHITE = 'w';
  var EMPTY = '_';
  var BLACK_HOVER = 'B';
  var WHITE_HOVER = 'W';
  var BLACK_POINT = '1';
  var WHITE_POINT = '2';
  var BLACK_DEAD = '3';
  var WHITE_DEAD = '4';
  var PLAY = 'play';
  var PASS = 'pass';
  var RESIGN = 'resign';

  exports.PLAY = PLAY;
  exports.PASS = PASS;
  exports.RESIGN = RESIGN;
  exports.WHITE = WHITE;
  exports.BLACK = BLACK;
  exports.WHITE = WHITE;
  exports.EMPTY = EMPTY;
  exports.BLACK_POINT = BLACK_POINT;
  exports.WHITE_POINT = WHITE_POINT;
  exports.BLACK_DEAD = BLACK_DEAD;
  exports.WHITE_DEAD = WHITE_DEAD;
  exports.BLACK_HOVER = BLACK_HOVER;
  exports.WHITE_HOVER = WHITE_HOVER;

  exports.longColor = longColor;
  
  function longColor (c) {

    return c == BLACK ? 'black' :
           c == WHITE ? 'white' : null;

  }

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

    if (!options.timestamp) {
      throw new Error('Move must have a timestamp.');
    }

    this.type = options.type;
    this.timestamp = options.timestamp;

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

  function Game(options) {

    var defaults = {
      black : 'black', // name of the player
      white : 'white', // name of the player
      blackPrisoners: 0, // cached stones removed from board earlier
      whitePrisoners: 0, // cached stones removed from board earlier
      boardSize : 19,
      handicaps : 0,
      komi : 6.5,
      started : null,
      timeMain : 3600, // seconds
      timeExtraPeriods : 3, // number of byo-yomi periods
      timePeriodLength : 60, // byo-yomi period length
      timeStonesPerPeriod : 1, // number of stones to be played per byo-yomi.
      scoreBoard : [],
      configurationOkBlack : false,
      configurationOkWhite : false,
      scoreOkBlack : false,
      scoreOkWhite : false,
      moves : [],

    };

    options = options || {};

    for (var key in defaults) {
      this[key] = options[key] !== undefined ? options[key] : defaults[key];
    }

    this.moves = this.moves.map(function (m) {
      return Move.fromObject(m);
    });

    this.boards = [new Board(this.boardSize)];

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

    return (this.timeMain * 1000) - total;

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

    if (username == this.black) { return BLACK; }

    if (username == this.white) { return WHITE; }

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
    var opp = opposite(move.stone);
    var curBoard = this.getBoard()
    var newBoard = curBoard.playStone(move);
    this.moves.push(move);
    var killed = curBoard.count(opp) - newBoard.count(opp);
    var m = this.moves[this.moves.length-1];
    var myAttr = longColor(move.stone) + 'Prisoners';
    this[myAttr] += killed;
    console.log(myAttr,this[myAttr]);
    this.boards.push(newBoard);

    return newBoard;

  };

  Game.prototype.getScore = function (color) {

    var removedPrisoners = 0;
    var score = removedPrisoners;
    var points = this.scoreBoard;

    if (!points) return null;

    for (var i = 0; i<this.boardSize*this.boardSize; i++) {

      var point = points[i];

      if (color === BLACK && point === BLACK_POINT) score += 1;
      if (color === BLACK && point === WHITE_DEAD)  score += 2;
      if (color === WHITE && point === WHITE_POINT) score += 1;
      if (color === WHITE && point === BLACK_DEAD)  score += 2;

    }

    return score;

  };

  Game.prototype.getState = function () {

    var moves = this.moves.length;
    var lastMove = moves > 0 ? this.moves[moves-1] : null;
    var last2Move = moves > 1 ? this.moves[moves-2] : null;
    var twoPasses = moves > 1 && lastMove.type == PASS && last2Move.type == PASS;
    var resign = moves > 0 && lastMove.type == RESIGN;
    var scored = this.scoreOkBlack && this.scoreOkWhite;

    if (twoPasses && scored) {

      var blackScore = this.getScore(BLACK);
      var whiteScore = this.getScore(WHITE);
      
      return {
        state: 'end',
        reason: 'points',
        points: Math.abs(blackScore-whiteScore),
        black: blackScore,
        white: whiteScore,
        winner: blackScore > whiteScore ? BLACK : WHITE
      };

    } else if (twoPasses && !scored) {

      return { state: 'scoring'};

    } else if (resign) {

      return { state: 'end', reason: 'resign', winner: opposite(lastMove.stone) };

    } else if (this.started) {

      return {state: 'playing', turn: this.getTurn()};

    } else {

      return {state: 'configuring'};

    }

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
      var prevBoard = this.getBoard(moveNumber-1);
      this.boards[moveNumber] = prevBoard.playStone(lastMove);

    }

    return this.boards[moveNumber];

  };

  Game.prototype.isPrisoner = function (row,column) {

    var scorePoint = this.scoreBoard[board.point2Index(row,column)] 

    return scorePoint == BLACK_DEAD || scorePoint == WHITE_DEAD;

  };

  Game.prototype.markOrUnmarkAsPrisoner = function (row,column) {

    var board = this.getBoard();
    var prisonerColor = board.getStone(row,column);
    var group = board.createPrisonerGroup(row,column,prisonerColor);

    if (prisonerColor === EMPTY) return null;

    if (this.isPrisoner(row,column)) {
      
      for (var index in group.points) {

        var point = board.index2Point(index);
        this.scoreBoard[board.point2Index(row,column)] = null;

      }
      
      for (var index in group.points) {

        possiblyScorePoint(index,board,this.scoreBoard);

      }
      
    } else {

      for (var hash in group.points) {

        var point = board.index2Point(hash);
        var containsPrisoner = board.getStoneByIndex(hash) != EMPTY;
        this.scoreBoard[board.point2Index(row,column)] =
          group.owner === BLACK && !containsPrisoner ? BLACK_POINT :
          group.owner === WHITE && !containsPrisoner ? WHITE_POINT :
          group.owner === BLACK &&  containsPrisoner ? WHITE_DEAD :
          group.owner === WHITE &&  containsPrisoner ? BLACK_DEAD : null;

      }

    }

    return group

  };

  Game.prototype.scorePoint = function (index) {

    if (this.scoreBoard) return this.scoreBoard[index];

    else return null;

  };

  Game.prototype.getInitialScoring = function () {

    var points = [];
    var board = this.getBoard();

    for (var i=0;i<board.boardSize * board.boardSize;i++) {

      points[i] = null;

    }

    for (var i=0;i<board.boardSize * board.boardSize;i++) {

      possiblyScorePoint(i,board,points);

    }

    this.scoreBoard = points;

    return points;

  };

  function Board(boardSize,init) {

    this.stones = [];
    this.boardSize = boardSize

    for (var i=0;i<boardSize*boardSize;i++) {

      this.stones[i] = init ? init(i) : EMPTY;

    }

  }

  Board.prototype.count = function (color) {

    var count = 0;

    for (var i=0;i<this.boardSize;i++) {

      count += this.stones[i] == color ? 1 : 0;

    }
    console.log(color,count);

    return count;

  }

  Board.prototype.validCoordinate = function (coordinate) {
    return (coordinate >= 0 && coordinate < this.boardSize);
  }

  Board.prototype.getStone = function (row,column) {

    return this.stones[this.point2Index(row,column)];

  };

  Board.prototype.setStone = function (row,column,content) {

    if (!this.validCoordinate(row)) {
      throw new Error('Invalid row ' + row);
    }
    if (!this.validCoordinate(column)) {
      throw new Error('Invalid column ' + column);
    }
    this.stones[row*this.boardSize+column] = content;

  };

  Board.prototype.setStoneByIndex = function (index,content) {

    return this.stones[index] = content;

  };

  Board.prototype.getStoneByIndex = function (index) {

    return this.stones[index];

  };

  Board.prototype.toString = function () {

    var counter = 0;
    var split = this.boardSize;

    var out = this.stones.map(function (cell,i) {
      
      return cell + ((i+1)%split === 0 ? '\n' : ' ');

    });

    return out.join("");

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

    function populator (i) { return s[i]; };

    var s = this.stones;
    var newBoard = new Board(this.boardSize,populator);

    if (move.type === 'pass' || move.type === 'resign') { return newBoard; }

    if (!this.isMoveOnBoard(move)) {
      throw new Error('Move is not on board: ' + move.row + ',' + move.column);
    }

    if (this.getStone(move.row,move.column) !== EMPTY) {
      console.log(this.stones);
      console.log(this.getStone(move.row,move.column),move.row,move.column);
      console.log(this.point2Index(move.row,move.column));
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

  Board.prototype.point2Index = function (row,column) {

    return row*this.boardSize + column;

  };

  Board.prototype.index2Point = function (hash) {

    var row = Math.floor (hash / this.boardSize);
    var column = hash % this.boardSize;

    return [row,column];

  };

  Board.prototype.createScoringGroup = function (index,prisoners) {
    var g = new Group(this,index);
    var neighbours = g.getNeighbours(this);
    var board = this;
    var surroundedBy = this.getStoneByIndex(Object.keys(neighbours).reduce(function (prev,cur) {

      var pStone = board.getStoneByIndex(prev);
      var cStone = board.getStoneByIndex(cur);

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

    var hash = board.point2Index(row,column)
    var stone = board.getStone(row,column);

    // If this is initial call, set desired point content
    if (this.content === undefined) {

      if (prisonerColor) {

        this.content = EMPTY;
        this.prisonerColor = prisonerColor;

      } else {

        this.content = stone;

      }

      this.points = { };

    }

    // Stop recursion if this point is already in the group.
    if (this.points[hash] !== undefined) { return; }

    // Stop recursion if this point is not of desired content
    else if (stone != this.content && stone != this.prisonerColor) { return; }

    // Otherwise add this point to the group and recurse.
    else {

      this.points[hash] = true;
      Group.bind(this)(board, row + 1,column);
      Group.bind(this)(board, row - 1,column);
      Group.bind(this)(board, row,column + 1);
      Group.bind(this)(board, row,column - 1);
      
    }

  };

  Group.prototype.removeFromBoard = function (board) {

    for (var index in this.points) {

      board.setStoneByIndex(index,EMPTY);

    }

  };

  Group.prototype.getNeighbours = function (board) {

    function tryToAddToNeighbours(points,row,column) {

      var index = board.point2Index(row,column);

      if (points[index] === undefined &&
          board.validCoordinate(row) &&
          board.validCoordinate(column)) {

        neighbours[index] = true;

      }

    }
    var neighbours = {};

    for (var index in this.points) {

      var point = board.index2Point(index);
      tryToAddToNeighbours(this.points,point[0]+1,point[1]);
      tryToAddToNeighbours(this.points,point[0]-1,point[1]);
      tryToAddToNeighbours(this.points,point[0],point[1]+1);
      tryToAddToNeighbours(this.points,point[0],point[1]-1);
    }

    return neighbours;

  };

  Group.prototype.getLiberties = function (board) {

    var neighbours = this.getNeighbours(board);
    var freedoms = Object.keys(neighbours).filter(function (index) {
      return (board.getStoneByIndex(index) === EMPTY)
    });

    return freedoms.length;

  };

  exports.newBoard = function (size,init) { return new Board(size,init); };
  exports.newMove = Move.fromObject;
  exports.json2Move = Move.fromString;
  
  function possiblyScorePoint (i,board,points) {

    if (board.stones[i] !== EMPTY || points[i] !== null) { return; }

    var group = board.createScoringGroup(i);

    for (var index in group.points) {

      points[index] = group.owner == BLACK ? BLACK_POINT :
                      group.owner == WHITE ? WHITE_POINT : EMPTY;

    }

  }


})(typeof exports === 'undefined' ? this.libgo = {} : exports);
