'use strict';

angular.module('aApp')

  .directive('player', [function () {

    return {

      template: '<div class="{{playerClass}}"> {{ngModel}} ({{timeLeft}}) ({{prisoners}}) </div>',
      restrict: 'E',
      scope: {
        ngModel: '=',
        color: '=',
        timeLeft: '=',
        turn: '=',
        prisoners: '='
      },

      link: function (scope) {

        scope.$watch('turn', function () {

          scope.playerClass = 'webgo-' + scope.color +
            (scope.turn ?  ' webgo-myturn' : '');

        });


      }

    };

  }]);
