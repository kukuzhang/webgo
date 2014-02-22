'use strict';

describe('Directive: player', function () {

  // load the directive's module
  beforeEach(module('aApp'));

  var element,
    html = '<player ng-model="black" color="\'black\'" turn="blackTurn" time-left="blackTime" prisoners="blackPrisoners"/>',
    scope;

  beforeEach(inject(function ($rootScope,$compile) {
    scope = $rootScope.$new();
    scope.black = 'Juho';
    scope.blackTurn = true;
    scope.blackTime = 1000;
    scope.blackPrisoners = 5;
    element = angular.element(html);
    element = $compile(element)(scope);
    scope.$apply();
  }));

  it('should show time', inject(function () {
    expect(element.text()).toContain('1000');
  }));

  it('should show player name', inject(function () {
    expect(element.text()).toContain('Juho');
  }));

  it('should show prisoners', inject(function () {
    expect(element.text()).toContain('5');
  }));

});
