'use strict';

describe('Service: stones2Scope', function () {

  var boardMock = {

    boardSize: 19,
    b: [
      '___________________',
      '___________________',
      '__w________________',
      '_______________b___',
      '___________________',
      '___________________',
      '___________________',
      '___________________',
      '___________________',
      '___________________',
      '___________________',
      '___________________',
      '___________________',
      '___________________',
      '___________________',
      '___________________',
      '___b_b_________w___',
      '___________________',
      '___________________',
    ],
    getStone: function (r,c) { return this.b[r][c]; }
  }
  // load the service's module
  beforeEach(module('aApp'));

  // instantiate service
  var scope,stones2Scope,libgo;
  beforeEach(inject(function (_stones2Scope_,$rootScope) {
    scope = $rootScope.$new();
    stones2Scope = _stones2Scope_;
  }));
  beforeEach(inject(function (_libgo_) {
    libgo = _libgo_;
  }));

  it('should assign proper stone values to scope', function () {
    expect(typeof stones2Scope).toBe('function');
    stones2Scope(scope,boardMock);
    expect(scope.stones[2][2]).toBe('w');
    expect(scope.stones[3][3]).toBe('_');
  });

});
