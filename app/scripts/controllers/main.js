'use strict';

//angular.module('aApp', ['webgoFilters']);
angular.module('aApp')
  .controller('MainCtrl', ['$scope', '$http', function ($scope, $http) {

  var serverUrl = '/api';
  $scope.games = [];
  $http({method:'GET',url:serverUrl + '/game'})
    .success(function (data) {
      $scope.games = data;
    })
    .error(function (data, status) {
      console.log('error ' + status);
    });

}]);
