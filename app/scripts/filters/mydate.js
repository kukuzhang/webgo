'use strict';

angular.module('aApp')
  .filter('mydate', function () {
    return function (input) {
      var now = new Date()
      var y = now.getFullYear();
      var then = new Date(input);

      if (!input) { return ''; }

      if (now.getFullYear() === then.getFullYear() &&
        now.getMonth() === then.getMonth() &&
        now.getDate() === then.getDate()) {
          
        return then.getHours() + ':' + then.getMinutes() + ':' + then.getSeconds() + '(GMT)';
        
      } else {
        
        return then.getFullYear() + '-' + then.getMonth() + '-' + then.getDate();
        
      }
    };
  });
