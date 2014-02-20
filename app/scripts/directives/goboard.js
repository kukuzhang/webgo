'use strict';

angular.module('aApp')
  .directive('coord', ['jquery', function ($) {
    return {

      restrict: 'A',

      link: function (scope,elem, attrs) {
        
        var coord = scope[attrs.coord] + 1;
        var display = scope[attrs.display];
        var size = scope[attrs.size] || 32;
        var $d = $('<div/>')
          .css('width',size)
          .css('height',size);
        elem.html($d);
        elem.addClass('webgo-coord');

        if (isNaN(coord)) {coord = '';}
        
        if (display) { $d.html(coord); }

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

      link: function (scope) {
        
        console.log(scope);
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
