'use strict';

angular.module('aApp')
  .directive('acceptor', function () {
    return {
      template: '<button ng-click="change()" {{disabled}}>{{msg}}</button>',
      restrict: 'E',
      scope : {
          'ngModel': '=',
          'active': '=',
          'change': '&'
      },
      link: function postLink(scope, element, attrs) {
        // console.log(scope.ngModel);
        // console.log(scope.change);
        // console.log(scope.active);
        scope.$watchCollection('[ngModel,active]', function () {
          scope.msg = scope.ngModel &&  scope.active ? 'Accepted':
                     !scope.ngModel &&  scope.active ? 'Click to accept':
                     scope.ngModel && !scope.active ? 'Opponent has accepted':
                     'Waiting for opponent to accept';
          scope.disabled = scope.active ? 'disabled' : '';
        });
      }
    };
  });
