'use strict';

describe('Service: Geometry', function () {

  var jqMock = function (src) {
  
    var jq = {
      width: function () {return 1000;},
      height: function () {return 1000;},
      resize: function () {return jq;},
      addClass: function () {return jq;},
      removeClass: function () {return jq;},
      attr: function () {return jq;},
      css: function () {return jq;},
    };
    
    return jq;

  }
  
  // load the service's module
  beforeEach(module('aApp'));
  beforeEach(module(function ($provide) {
    $provide.value('jquery', jqMock);
  }));


  // instantiate service
  var Geometry;
  beforeEach(inject(function (_Geometry_) {
    Geometry = _Geometry_;
  }));

  it('should do something', function () {
    expect(!!Geometry).toBe(true);
  });

});
