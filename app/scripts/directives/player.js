'use strict';

angular.module('aApp')

  .directive('player', [function () {

    return {

      template: '<div class="{{playerClass}}"> {{ngModel.name}} </div>',
      restrict: 'E',
      scope: { ngModel: '=' },

      link: function (scope) {

        function setClasses() {

          var player = scope.ngModel || {};
          console.log(scope.ngModel);
          scope.playerClass = 'webgo-' + player.color +
            (player.turn ?  ' webgo-myturn' : '');

        }

        scope.$watch('ngModel', setClasses);

      }

    };

  }]);
