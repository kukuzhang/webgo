'use strict';

angular.module('aApp')
  .directive('header', function ($location) {
    return {
      templateUrl: 'views/header.html',
      restrict: 'E',
      link: function postLink(scope) {
        
        scope.authRedirect = '%23' + $location.url();

      }
    };
  });
