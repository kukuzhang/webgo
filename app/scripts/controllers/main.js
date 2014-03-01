'use strict';

//angular.module('aApp', ['webgoFilters']);
angular.module('aApp')
  .controller('MainCtrl', ['$scope', '$http', '$location', 'Geometry', 'identity',
      function ($scope, $http, $location, Geometry, identity) {

  var creating = false;
  var apiUrl = '/api/game';
  var pPrefix = '/game/';

  function action () {

    if (creating) {
      console.log('game is being created already.');
      return;
    }
    creating = true;
    $http.post(apiUrl,{})
      .success(function (ok) {
        creating = false;
        console.log(ok);
        $location.path(pPrefix + ok.id);
      })
      .error(function(e) { creating = false; $scope.fail='Failed. ' + e; });
    
  }

  var serverUrl = '/api';
  $scope.notPlaying = true;
  $scope.stones = [];
  $scope.games = [];
  $scope.actions = [
    {name:'new-game',label:'New game'}
  ];
  $scope.action = action;
  $http({method:'GET',url:serverUrl + '/game'})
    .success(function (data) {
      $scope.games = data;
    })
    .error(function (data, status) {
      console.log('error ' + status);
    });

}]);
