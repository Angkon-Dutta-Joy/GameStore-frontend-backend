'use strict';

/**
 * genres.controller.js
 *
 * GenresListController — /genres
 */
angular
  .module('gameStoreApp')
  .controller('GenresListController', ['ApiService',
    function (ApiService) {
      var vm = this;

      vm.genres    = [];
      vm.isLoading = true;
      vm.errorMsg  = null;

      ApiService.getGenres()
        .then(function (data) {
          vm.genres = data;
        })
        .catch(function (err) {
          vm.errorMsg = err;
        })
        .finally(function () {
          vm.isLoading = false;
        });
    }
  ]);

  