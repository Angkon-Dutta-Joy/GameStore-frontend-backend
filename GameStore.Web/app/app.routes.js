'use strict';

/**
 * app.routes.js — Configures ngRoute for the GameStore SPA.
 *
 * Routes:
 *  /            → games list
 *  /games       → games list (alias)
 *  /games/new   → create game form
 *  /games/:id   → game details
 *  /games/:id/edit → edit game form
 *  /genres      → genres list
 */
angular
  .module('gameStoreApp')
  .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    $routeProvider

      .when('/', {
        templateUrl: 'views/games/list.html',
        controller: 'GamesListController',
        controllerAs: 'vm'
      })

      .when('/games', {
        templateUrl: 'views/games/list.html',
        controller: 'GamesListController',
        controllerAs: 'vm'
      })

      .when('/games/new', {
        templateUrl: 'views/games/create.html',
        controller: 'GameCreateController',
        controllerAs: 'vm'
      })

      .when('/games/:id/edit', {
        templateUrl: 'views/games/edit.html',
        controller: 'GameEditController',
        controllerAs: 'vm'
      })

      .when('/games/:id', {
        templateUrl: 'views/games/details.html',
        controller: 'GameDetailsController',
        controllerAs: 'vm'
      })

      .when('/genres', {
        templateUrl: 'views/genres/list.html',
        controller: 'GenresListController',
        controllerAs: 'vm'
      })

      .otherwise({
        redirectTo: '/'
      });

    // Use hash-based routing (no server config needed)
    $locationProvider.hashPrefix('!');
  }]);
