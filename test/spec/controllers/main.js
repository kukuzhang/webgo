'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('aApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should attach an array of games to the scope', function () {
    /*
    console.log(Object.keys(expect(scope.games)));
    console.log(expect(scope.games).to);
    expect(scope.games).to.have.property('length');
    */
  });
});
