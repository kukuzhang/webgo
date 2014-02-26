'use strict';

angular.module('aApp')
  .service('identity', function Identity($http, $rootScope) {

    // AngularJS will instantiate a singleton by calling "new" on this function

    var me = null;
    this.refresh = function () {

      $http.get('/auth')
        .success(function (data) {
          me = data;
          $rootScope.user = data;
        })
        .error(function (data) { console.log('error retrieving user info',data); });

    };

    this.isThisMe = function (user) {

      if (!me) { return false; }

      return ( user.provider === me.provider ) && ( user.id === me.id );

    };

    this.myColor = function (game) {

      if (!game) return null;

      if (this.isThisMe(game.black)) { return 'black'; }

      if (this.isThisMe(game.white)) { return 'white'; }

      return null;

    };

    this.refresh();

  });
