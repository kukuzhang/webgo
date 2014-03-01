'use strict';

angular.module('aApp')
  .directive('acceptor', function () {
    return {
      template: '<label> </label><button ng-click="change()" ng-disabled="{{!me}}">{{msg}}</button>',
      restrict: 'E',
      scope : {
        'ngModel': '=',
        'me': '='
      },
      link: function postLink(scope) {
        // console.log(scope.ngModel);
        // console.log(scope.change);
        // console.log(scope.me);

        scope.change = function () { scope.ngModel = !scope.ngModel; };

        scope.$watchCollection('[ngModel,me]', function () {
          scope.msg = scope.ngModel &&  scope.me ? 'Accepted':
                     !scope.ngModel &&  scope.me ? 'Click to accept':
                     scope.ngModel && !scope.me ? 'Opponent has accepted':
                     'Waiting for opponent to accept';
          scope.disabled = scope.me ? 'disabled' : '';
        });
      }
    };
  });
