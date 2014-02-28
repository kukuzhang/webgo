'use strict';

angular.module('aApp')
  .directive('coord', ['jquery', function ($) {
    return {
	  template: '<div style="myStyle">{{visibleCoord}}</div>',
      scope: {
        coord: '=',
        size: '='
      },

      restrict: 'A',

      link: function (scope,elem, attrs) {
        
        if (isNaN(scope.coord)) {
			
			scope.visibleCoord = '';
			
		} else {
			
			scope.visibleCoord = scope.coord + 1;
			
		}
		elem.addClass('webgo-coord');
        scope.$watch('size', function (val,old) {
			var size = scope.sSize;
			scope.myStyle = {width:size,height:size};
			console.log('size change here', old,val);
		});
		

      },

    };
  }])
  .directive('goboard', function () {

    return {

      templateUrl: 'views/goboard.html',
      restrict: 'E',
      //require: '^stones',
      scope: {
        stones: '=',
        coords: '=',
        stoneSize: '=',
        cbPlay: '&',
        cbHover: '&',
        cbHoverOut: '&'
      },

      link: function (scope, elem) {

		scope.$watch('coords', function (x) {
			scope.boardCoordClass = x ? "with-coordinates" : "without-coordinates";
		});
		scope.$watch('stoneSize', function () {
			scope.sSize = scope.stoneSize || 32;
			console.log('stonestize change here',scope.sSize);
			scope.sizeStyle = {width:scope.sSize,height:scope.sSize};

		});
            scope.cellClass = function (row,col) {

          var boardSize = scope.stones.length;
          var classes = [];

          if (row === 0) { classes.push('top'); }
          if (col === 0) { classes.push('left'); }
          if (row === boardSize-1) { classes.push('bottom'); }
          if (col === boardSize-1) { classes.push('right'); }

          return classes;

        };

      },

    };

  });
