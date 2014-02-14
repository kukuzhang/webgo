'use strict';

angular.module('aApp')

  .directive('player', ['libgo',function (libgo) {

    return {

      template: '<div class="{{playerClass}}"> {{player.name}} </div>',
      restrict: 'E',
      scope: {
        player: '=',
        turn: '='
      },

      link: function (scope, element, attrs) {

        var player = scope.player || {}
        var color = player.color;
        scope.playerName = player.name;
        console.log('linking!',color,player);
        scope.$watch('turn', setClasses);
        
        function setClasses() {

          scope.playerClass = (color === libgo.BLACK) ? 'webgo-black' :
                              (color === libgo.WHITE) ? 'webgo-white' :
                              'webgo-unknown'
          scope.playerClass += (player.isMyTurn(scope.turn)) ?
            ' webgo-myturn' : '';

        }

      }

    };

  }]);
