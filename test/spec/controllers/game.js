'use strict';

describe('Controller: GameCtrl', function () {

  // load the controller's module
  beforeEach(module('aApp'));

  var GameCtrl,
    scope,
    routeParamsMock = {auth:'nimi:salasana',gameId:'40005'},
    gameSocketMock = {
      gameFromSocket: {
        white: {'name':'jip'},
        black: {'name':'jap'},
        boardSize: 19,
        komi: 6.5,
        handicaps: 0,
        timeMain: 3600,
        timeExtraPeriods: 3,
        timeStonesPerPeriod: 3,
        timePeriodLength: 100,
        blackPrisoners: 1,
        whitePrisoners: 2,
        remainingMilliSeconds: function () {return 3600000;},
        getTurn: function () {return 'b';},
        getState: function () { return {state: 'playing'}; },
        getBoard: function () { var b = []; for (var i = 0; i < 19*19; i++) {b.push('_');} return b; },
      },

      routeByGameState: function () { return; },
      connectTo: function (gameId, user, pwd) { return; },
      getGame: function () { return this.gameFromSocket; },
      requestGame: function () { return null; },
      isConnected: function () { return true; },
      getConnectionStatus: function () { return 'websocket'; },
      on: function (ev,cb) {

        console.log(ev);
      }

      
    };

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

  beforeEach(module(function ($provide) {
    $provide.value('libgo', libgoMock);
  }));

  beforeEach(module(function ($provide) {
    $provide.value('$routeParams', routeParamsMock);
  }));
  beforeEach(module(function ($provide) {
    $provide.value('GameSocket', gameSocketMock);
  }));
  beforeEach(module(function ($provide) {
    $provide.value('Geometry', {});
  }));


  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GameCtrl = $controller('GameCtrl', {
      $scope: scope
    });
  }));

  it('should set scope parameters from game received.', function () {
    for (var attr in gameSocketMock.gameFromSocket) {
      var val = gameSocketMock.gameFromSocket[attr];
      if (typeof(val) === 'function') { continue; }
      expect(scope[attr]).toBe(val);
    }
  });
});
