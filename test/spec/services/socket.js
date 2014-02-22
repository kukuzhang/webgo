'use strict';

describe('Service: Socket', function () {

  var connectUrl, connectOpts;
  var socketMock = {

    on: function (ev,cb) { console.log('registering to event',ev); }
  };
  var socketioMock = {

    connect: function(url,opts) {
      
      connectUrl = url;
      connectOpts = opts;

      return socketMock;

    }

  };
  // load the service's module
  beforeEach(module('aApp'));

  beforeEach(module(function ($provide) {
    $provide.value('socketio', socketioMock);
  }));

  // instantiate service
  var GameSocket;
  beforeEach(inject(function (_GameSocket_) {
    GameSocket = _GameSocket_;
  }));

  it('should connect to gameId', function () {
    expect(!!GameSocket).toBe(true);
    expect(typeof GameSocket.connectTo).toBe('function');
    GameSocket.connectTo(12345,'nimi','salasana');
    expect(connectUrl).toBe('http://localhost:3000/');
    expect(connectOpts.query).toBeDefined();

  });

});
