'use strict';

/**
 * api.service.js — Centralised HTTP service.
 *
 * All backend communication is funnelled through this service.
 * Update API_BASE_URL to match your environment.
 */
angular
  .module('gameStoreApp')
  .factory('ApiService', ['$http', '$q', function ($http, $q) {

    var API_BASE_URL = 'http://localhost:5055';

    /**
     * Private helper — perform an HTTP request and return a promise
     * that resolves with response.data or rejects with a friendly message.
     */
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
              // ASP.NET validation problem details
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

    // ─── Games ───────────────────────────────────────────────────────────────

    function getGames() {
      return request('GET', '/games');
    }

    function getGame(id) {
      return request('GET', '/games/' + id);
    }

    function createGame(game) {
      return request('POST', '/games', game);
    }

    function updateGame(id, game) {
      return request('PUT', '/games/' + id, game);
    }

    function deleteGame(id) {
      return request('DELETE', '/games/' + id);
    }

    // ─── Genres ──────────────────────────────────────────────────────────────

    function getGenres() {
      return request('GET', '/genres');
    }

    // ─── Public API ──────────────────────────────────────────────────────────

    return {
      getGames:   getGames,
      getGame:    getGame,
      createGame: createGame,
      updateGame: updateGame,
      deleteGame: deleteGame,
      getGenres:  getGenres
    };
  }]);
