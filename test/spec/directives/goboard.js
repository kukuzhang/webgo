'use strict';

describe('Directive: goboard', function () {

  // load the directive's module
  beforeEach(module('aApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

/*
  it('should make hidden element visible', inject(function ($compile) {
    scope.stones = [];
    for (var i = 0; i<19; i++) {
      scope.stones[i] = [];
      for(var j = 0; j<19; j++) stones[i][j] = '_';
    }
    element = angular.element('<goboard stones="stones"></goboard>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('');
  }));
*/
});
