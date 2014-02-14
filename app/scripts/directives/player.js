'use strict';

angular.module('aApp')
  .directive('player', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the player directive');
      }
    };
  });
