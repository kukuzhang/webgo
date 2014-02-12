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
    element = angular.element('<goboard></goboard>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the goboard directive');
  }));
  */
});
