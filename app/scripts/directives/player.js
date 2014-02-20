'use strict';

angular.module('aApp')

  .directive('player', [function () {

    return {

      template: '<div class="{{playerClass}}"> {{ngModel.name}} ({{timeLeft}}) ({{prisoners}}) </div>',
      restrict: 'E',
      scope: {
        ngModel: '=',
        timeLeft: '=',
        prisoners: '='
      },

      link: function (scope) {

        scope.$watch('ngModel', function () {

          var player = scope.ngModel || {};
          scope.playerClass = 'webgo-' + player.color +
            (player.turn ?  ' webgo-myturn' : '');

        });


      }

    };

  }]);
