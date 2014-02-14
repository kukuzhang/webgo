'use strict';

angular.module('aApp')
  .controller('NewGameCtrl', ['$scope','$http','$location',function ($scope,$http,$location) {
    var apiUrl = '/api/game';
    var pPrefix = '/game/';

    $http.post(apiUrl,{})
      .success(function (ok) {
        console.log(ok);
        $location.path(pPrefix + ok.id);
      })
      .error(function(e) { $scope.fail='Failed. ' + e; });
  }]);
