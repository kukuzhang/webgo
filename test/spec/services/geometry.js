'use strict';

describe('Service: Geometry', function () {

  // load the service's module
  beforeEach(module('appApp'));

  // instantiate service
  var Geometry;
  beforeEach(inject(function (_Geometry_) {
    Geometry = _Geometry_;
  }));

  it('should do something', function () {
    expect(!!Geometry).toBe(true);
  });

});
