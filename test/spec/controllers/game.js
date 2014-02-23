'use strict';

describe('Controller: GameCtrl', function () {

  // load the controller's module
  beforeEach(module('aApp'));

  var GameCtrl,
    scope,
    requestedGame,
    requestedUser,
    requestedPwd,
    routeParamsMock = {auth:'nimi:salasana',gameId:'40005'},
    gameSocketMock = {

      routeByGameState: function () { return; },
      connectTo: function (gameId, user, pwd) {

        console.log('connectTTo!!!',gameId,user,pwd);
        requestedGame = gameId;
        requestedUser = user;
        requestedPwd = pwd;

      },
      getGame: function () { console.log('requesting game'); },
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

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    requestedGame=null;
    requestedUser=null;
    requestedPwd=null;
    GameCtrl = $controller('GameCtrl', {
      $scope: scope
    });
  }));

  it('should automatically request a game with proper parameters.', function () {
    expect(requestedGame).toBe('40005');
    expect(requestedUser).toBe('nimi');
    expect(requestedPwd).toBe('salasana');
  });
});
