'use strict';

angular.module('aApp')

  .directive('player', [function () {

    return {

      template: '<div class="{{playerClass}}"> {{ngModel.name}} "{{timeLeft}}" </div>',
      restrict: 'E',
      scope: {
        ngModel: '=',
        timeLeft: '='
      },

      link: function (scope,elem,attrs) {

        scope.$watch('ngModel', function () {

          var player = scope.ngModel || {};
          scope.playerClass = 'webgo-' + player.color +
            (player.turn ?  ' webgo-myturn' : '');

        });


      }

    };

  }]);
