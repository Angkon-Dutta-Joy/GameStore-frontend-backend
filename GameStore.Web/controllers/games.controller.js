'use strict';

/**
 * games.controller.js
 *
 * Contains all four controllers related to the Games resource:
 *   GamesListController   — /games
 *   GameDetailsController — /games/:id
 *   GameCreateController  — /games/new
 *   GameEditController    — /games/:id/edit
 */

// ─── Games List ──────────────────────────────────────────────────────────────

angular
  .module('gameStoreApp')
  .controller('GamesListController', ['ApiService', '$location',
    function (ApiService, $location) {
      var vm = this;

      vm.games       = [];
      vm.isLoading   = true;
      vm.errorMsg    = null;
      vm.successMsg  = null;
      vm.deletingId  = null;

      // ── Load games on init ────────────────────────────────────────────────
      function loadGames() {
        vm.isLoading = true;
        vm.errorMsg  = null;

        ApiService.getGames()
          .then(function (data) {
            vm.games = data;
          })
          .catch(function (err) {
            vm.errorMsg = err;
          })
          .finally(function () {
            vm.isLoading = false;
          });
      }

      // ── Navigate to details ───────────────────────────────────────────────
      vm.viewDetails = function (id) {
        $location.path('/games/' + id);
      };

      // ── Navigate to edit ──────────────────────────────────────────────────
      vm.editGame = function (id) {
        $location.path('/games/' + id + '/edit');
      };

      // ── Delete a game ─────────────────────────────────────────────────────
      vm.deleteGame = function (id, name) {
        if (!window.confirm('Delete "' + name + '"? This cannot be undone.')) {
          return;
        }

        vm.deletingId = id;
        vm.errorMsg   = null;
        vm.successMsg = null;

        ApiService.deleteGame(id)
          .then(function () {
            vm.successMsg = '"' + name + '" was deleted successfully.';
            vm.games = vm.games.filter(function (g) { return g.id !== id; });
          })
          .catch(function (err) {
            vm.errorMsg = err;
          })
          .finally(function () {
            vm.deletingId = null;
          });
      };

      // ── Bootstrap ─────────────────────────────────────────────────────────
      loadGames();
    }
  ]);


// ─── Game Details ─────────────────────────────────────────────────────────────

angular
  .module('gameStoreApp')
  .controller('GameDetailsController', ['ApiService', '$routeParams', '$location',
    function (ApiService, $routeParams, $location) {
      var vm = this;

      vm.game      = null;
      vm.isLoading = true;
      vm.errorMsg  = null;

      ApiService.getGame($routeParams.id)
        .then(function (data) {
          vm.game = data;
        })
        .catch(function (err) {
          vm.errorMsg = err;
        })
        .finally(function () {
          vm.isLoading = false;
        });

      vm.goBack = function () {
        $location.path('/games');
      };

      vm.editGame = function () {
        $location.path('/games/' + $routeParams.id + '/edit');
      };
    }
  ]);


// ─── Game Create ──────────────────────────────────────────────────────────────

angular
  .module('gameStoreApp')
  .controller('GameCreateController', ['ApiService', '$location',
    function (ApiService, $location) {
      var vm = this;

      vm.genres     = [];
      vm.errorMsg   = null;
      vm.isLoading  = false;
      vm.isSaving   = false;

      // Form model — matches CreateGameDto
      vm.game = {
        name:        '',
        genreId:     null,
        price:       null,
        releaseDate: ''
      };

      // Load genres for dropdown
      ApiService.getGenres()
        .then(function (data) {
          vm.genres = data;
        })
        .catch(function (err) {
          vm.errorMsg = err;
        });

      vm.submit = function (form) {
          if (form.$invalid) {
              form.$setSubmitted();
              return;
          }

          vm.isSaving = true;
          vm.errorMsg = null;

          // ── FIX: ensure date is sent as plain YYYY-MM-DD string ──
          var rawDate = vm.game.releaseDate;
          var formattedDate = rawDate instanceof Date
              ? rawDate.toISOString().substring(0, 10)
              : String(rawDate).substring(0, 10);

          var payload = {
              name:        vm.game.name,
              genreId:     parseInt(vm.game.genreId, 10),
              price:       parseFloat(vm.game.price),
              releaseDate: formattedDate   // ← always "YYYY-MM-DD"
          };

          ApiService.createGame(payload)
              .then(function () {
                  $location.path('/games');
              })
              .catch(function (err) {
                  vm.errorMsg = err;
              })
              .finally(function () {
                  vm.isSaving = false;
              });
      };

      vm.cancel = function () {
        $location.path('/games');
      };
    }
  ]);


// ─── Game Edit ────────────────────────────────────────────────────────────────

angular
  .module('gameStoreApp')
  .controller('GameEditController', ['ApiService', '$routeParams', '$location',
    function (ApiService, $routeParams, $location) {
      var vm = this;

      vm.genres    = [];
      vm.game      = null;
      vm.errorMsg  = null;
      vm.isLoading = true;
      vm.isSaving  = false;

      // Load genres and game details in parallel
      var genresLoaded = false;
      var gameLoaded   = false;

      function checkAllLoaded() {
        if (genresLoaded && gameLoaded) {
          vm.isLoading = false;
        }
      }

      ApiService.getGenres()
        .then(function (data) {
          vm.genres = data;
        })
        .catch(function (err) {
          vm.errorMsg = err;
        })
        .finally(function () {
          genresLoaded = true;
          checkAllLoaded();
        });

      ApiService.getGame($routeParams.id)
        .then(function (data) {
          // GameDetailsDto has genreId (not genre name)
          vm.game = {
            name:        data.name,
            genreId:     data.genreId,
            price:       data.price,
            releaseDate: data.releaseDate   // "YYYY-MM-DD" string
          };
        })
        .catch(function (err) {
          vm.errorMsg = err;
        })
        .finally(function () {
          gameLoaded = true;
          checkAllLoaded();
        });

      vm.submit = function (form) {
      if (form.$invalid) {
          form.$setSubmitted();
          return;
      }

      vm.isSaving = true;
      vm.errorMsg = null;

      // ── FIX: ensure date is sent as plain YYYY-MM-DD string ──
      var rawDate = vm.game.releaseDate;
      var formattedDate = rawDate instanceof Date
          ? rawDate.toISOString().substring(0, 10)
          : String(rawDate).substring(0, 10);

      var payload = {
          name:        vm.game.name,
          genreId:     parseInt(vm.game.genreId, 10),
          price:       parseFloat(vm.game.price),
          releaseDate: formattedDate   // ← always "YYYY-MM-DD"
      };

      ApiService.updateGame($routeParams.id, payload)
          .then(function () {
              $location.path('/games');
          })
          .catch(function (err) {
              vm.errorMsg = err;
          })
          .finally(function () {
              vm.isSaving = false;
          });
  };

      vm.cancel = function () {
        $location.path('/games');
      };
    }
  ]);
