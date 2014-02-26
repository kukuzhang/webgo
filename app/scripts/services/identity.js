'use strict';

angular.module('aApp')
  .service('identity', ['$http', '$rootScope',
      function Identity($http, $rootScope) {

    // AngularJS will instantiate a singleton by calling "new" on this function

    var me = null;
    this.refresh = function () {

      $http.get('/auth')
        .success(function (data) {
          me = data;
          console.log('ok',me);
          $rootScope.user = data;
        })
        .error(function (data) { console.log('error retrieving user info',data); });

    };

    this.isThisMe = function (user) {

      return this.equals(user,me);

    };

    this.myColor = function (game) {

      if (!game) return null;

      if (this.isThisMe(game.black)) { return 'black'; }

      if (this.isThisMe(game.white)) { return 'white'; }

      return null;

    };

    this.equals = function (a,b) {

      return a && b && ( a.provider === b.provider ) && ( a.id === b.id );

    }

    this.me = function () { return me; };

    this.refresh();

  }]);
