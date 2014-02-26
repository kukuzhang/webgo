'use strict';

angular.module('aApp')
  .service('identity', function Identity($http, $rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    this.refresh = function () {
    console.log('yy');
      $http.get('/auth')
        .success(function (data) {
          console.log(data);
          $rootScope.user = data;
        })
        .error(function (data) { console.log('error retrieving user info',data); });
        ;
    };
    this.refresh();
    console.log('xx');

  });
