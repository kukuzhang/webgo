'use strict';

angular.module('aApp')

  .directive('player', ['libgo',function (libgo) {

    return {

      template: '<div class="{{playerClass}}"> {{ngModel.name}} </div>',
      restrict: 'E',
      scope: { ngModel: '=' },

      link: function (scope, element, attrs) {

        var player = scope.ngModel || {}
        console.log('linking!',player);
        scope.$watch('ngModel', setClasses);
        
        function setClasses() {

          var player = scope.ngModel || {}
          scope.playerClass = 'webgo-' + player.color +
            (player.turn ?  ' webgo-myturn' : '');

        }

      }

    };

  }]);
