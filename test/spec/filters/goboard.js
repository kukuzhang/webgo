'use strict';

describe('Filter: stoneUrl', function () {

  // load the filter's module
  beforeEach(module('aApp'));

  // initialize a new instance of the filter before each test
  var stoneUrl;
  beforeEach(inject(function ($filter) {
    stoneUrl = $filter('stoneUrl');
  }));

/*
  it('should return the input prefixed with "stoneUrl filter:"', function () {
    var text = 'angularjs';
    expect(stoneUrl(text)).toBe('stoneUrl filter: ' + text);
  });
  */

});
