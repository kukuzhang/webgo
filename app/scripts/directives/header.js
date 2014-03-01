'use strict';

angular.module('aApp')
  .directive('header', function () {
    return {
      templateUrl: 'views/header.html',
      restrict: 'E',
      link: function postLink() {

      }
    };
  });
