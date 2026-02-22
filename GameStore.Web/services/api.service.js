'use strict';

/**
 * api.service.js — Centralised HTTP service.
 * All backend communication is funnelled through this service.
 */
angular
  .module('gameStoreApp')
  .factory('ApiService', ['$http', '$q', function ($http, $q) {

    var API_BASE_URL = 'http://localhost:5055';

    function request(method, url, data) {
      var config = {
        method: method,
        url: API_BASE_URL + url,
        headers: { 'Content-Type': 'application/json' }
      };

      if (data !== undefined) {
        config.data = data;
      }

      return $http(config)
        .then(function (response) {
          return response.data;
        })
        .catch(function (error) {
          var message = 'An unexpected error occurred.';

          if (error && error.data) {
            if (typeof error.data === 'string') {
              message = error.data;
            } else if (error.data.title) {
              message = error.data.title;
            } else if (error.data.errors) {
              var errors = [];
              angular.forEach(error.data.errors, function (msgs) {
                errors = errors.concat(msgs);
              });
              message = errors.join(' ');
            }
          } else if (error && error.status === 0) {
            message = 'Cannot reach the server. Make sure the backend is running.';
          } else if (error && error.status === 404) {
            message = 'Resource not found (404).';
          }

          return $q.reject(message);
        });
    }

    function getGames()         { return request('GET',    '/games'); }
    function getGame(id)        { return request('GET',    '/games/' + id); }
    function createGame(game)   { return request('POST',   '/games', game); }
    function updateGame(id, g)  { return request('PUT',    '/games/' + id, g); }
    function deleteGame(id)     { return request('DELETE', '/games/' + id); }
    function getGenres()        { return request('GET',    '/genres'); }

    return {
      getGames:   getGames,
      getGame:    getGame,
      createGame: createGame,
      updateGame: updateGame,
      deleteGame: deleteGame,
      getGenres:  getGenres
    };
  }]);
