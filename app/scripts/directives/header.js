'use strict';

angular.module('aApp')
  .directive('header', function () {
    return {
      templateUrl: 'views/header.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
		  scope.$watch('containerPixels', function (val) {
			  console.log(val);
			  if (scope.orientation == 'vertical') {

			    element.css('max-width',null);
			    element.css('max-height',val);
			    
			  } else {

			    element.css('max-width',val);
			    element.css('max-height',null);
				  
			  }
		  });

      }
    };
  });
