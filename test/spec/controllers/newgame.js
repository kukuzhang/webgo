'use strict';

describe('Controller: NewgameCtrl', function () {

  // load the controller's module
  beforeEach(module('aApp'));

  var NewgameCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NewgameCtrl = $controller('NewgameCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
