'use strict';

describe('Filter: mydate', function () {

  // load the filter's module
  beforeEach(module('aApp'));

  // initialize a new instance of the filter before each test
  var mydate;
  beforeEach(inject(function ($filter) {
    mydate = $filter('mydate');
  }));

  it('should return the input prefixed with "mydate filter:"', function () {
    var text = 'angularjs';
    expect(mydate(text)).toBe('mydate filter: ' + text);
  });

});
