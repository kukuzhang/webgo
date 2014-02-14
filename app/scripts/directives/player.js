'use strict';

angular.module('aApp')
  .directive('player', function () {
    return {
      template: '<div class="{{playerClass}}"> {{player.name}} </div>',
      restrict: 'E',
      scope: {
        player: '='
      },
      link: function (scope, element, attrs) {

        var player = scope.player || {}
        var color = player.color;
        scope.playerName = player.name;
        console.log('linking!',color,player);
        
        scope.playerClass = (color === 'black') ? 'webgo-black' :
                            (color === 'white') ? 'webgo-white' :
                            'webgo-unknown'

      }
    };
  });
