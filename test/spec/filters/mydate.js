'use strict';

describe('Filter: mydate', function () {

  // load the filter's module
  beforeEach(module('aApp'));

  // initialize a new instance of the filter before each test
  var mydate;
  beforeEach(inject(function ($filter) {
    mydate = $filter('mydate');
  }));

  it('should show current time in hours, minutes and seconds"', function () {
    var d = new Date();
    var millisecs = d.getTime();
    var s = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '(GMT)';
    expect(mydate(millisecs)).toBe(s);
    
    var d2 = new Date(10000000);
    var millisecs2 = d2.getTime();
    var s2 = d2.getFullYear() + '-' + d2.getMonth() + '-' + d2.getDate();
    expect(mydate(millisecs2)).toBe(s2);
    
  });

});
