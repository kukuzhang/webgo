'use strict';

angular.module('aApp')

  .directive('player', [function () {

    return {

      templateUrl: 'views/player.html',
      restrict: 'A',
      scope: {
        ngModel: '=',
        color: '=',
        timeLeft: '=',
        turn: '=',
        prisoners: '='
      },

      link: function (scope, elem) {

        scope.$watch('turn', function () {

          if (scope.turn) {
            
            elem.addClass('webgo-myturn');
            
          } else {

            elem.removeClass('webgo-myturn');

          }

        });


      }

    };

  }]);
