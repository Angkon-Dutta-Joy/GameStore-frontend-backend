'use strict';

angular
  .module('gameStoreApp')
  .controller('GamesController', ['ApiService', '$timeout', function (ApiService, $timeout) {
    var vm = this;

    // ── State ─────────────────────────────────────────────────────────────────
    vm.games           = [];
    vm.genres          = [];
    vm.isLoading       = true;
    vm.errorMsg        = null;
    vm.successMsg      = null;
    vm.deletingId      = null;
    vm.isSaving        = false;
    vm.selectedGame    = null;
    vm.createErrorMsg  = null;
    vm.editErrorMsg    = null;
    vm.detailsErrorMsg = null;
    vm.genresError     = null;

    vm.newGame  = { name: '', genreId: null, price: null, releaseDate: '' };
    vm.editGame = { id: null, name: '', genreId: null, price: null, releaseDate: '' };

    // ── Modal helpers ─────────────────────────────────────────────────────────
    function showModal(id) {
      var el = document.getElementById(id);
      if (el) { bootstrap.Modal.getOrCreateInstance(el).show(); }
    }
    function hideModal(id) {
      var el = document.getElementById(id);
      if (el) { bootstrap.Modal.getOrCreateInstance(el).hide(); }
    }

    // ── Date helper ───────────────────────────────────────────────────────────
    function formatDate(raw) {
      if (!raw) { return ''; }
      if (raw instanceof Date) { return raw.toISOString().substring(0, 10); }
      return String(raw).substring(0, 10);
    }

    // ── Auto-dismiss success ──────────────────────────────────────────────────
    function autoDismissSuccess() {
      $timeout(function () { vm.successMsg = null; }, 4000);
    }

    // ── Load games ────────────────────────────────────────────────────────────
    function loadGames() {
      vm.isLoading = true;
      vm.errorMsg  = null;
      ApiService.getGames()
        .then(function (data) { vm.games = data; })
        .catch(function (err) { vm.errorMsg = err; })
        .finally(function ()  { vm.isLoading = false; });
    }

    function loadGenres() {
      ApiService.getGenres()
        .then(function (data) { vm.genres = data; })
        .catch(function (err) { vm.genresError = err; });
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    vm.openCreateModal = function () {
      vm.newGame        = { name: '', genreId: null, price: null, releaseDate: '' };
      vm.createErrorMsg = null;
      showModal('createGameModal');
    };

    vm.submitCreate = function (form) {
      if (form.$invalid) {
        form.$setSubmitted();
        return;
      }
      vm.isSaving       = true;
      vm.createErrorMsg = null;

      ApiService.createGame({
        name:        vm.newGame.name,
        genreId:     parseInt(vm.newGame.genreId, 10),
        price:       parseFloat(vm.newGame.price),
        releaseDate: formatDate(vm.newGame.releaseDate)
      })
        .then(function () {
          hideModal('createGameModal');
          vm.successMsg = '"' + vm.newGame.name + '" created successfully!';
          loadGames();
          autoDismissSuccess();
        })
        .catch(function (err) { vm.createErrorMsg = err; })
        .finally(function ()  { vm.isSaving = false; });
    };

    // ── DETAILS ───────────────────────────────────────────────────────────────
    vm.openDetailsModal = function (game) {
      vm.selectedGame    = null;
      vm.detailsErrorMsg = null;
      showModal('detailsGameModal');
      ApiService.getGame(game.id)
        .then(function (data) { vm.selectedGame = data; })
        .catch(function (err) { vm.detailsErrorMsg = err; });
    };

    // ── EDIT ──────────────────────────────────────────────────────────────────
    vm.openEditModal = function (game) {
      vm.editErrorMsg = null;
      vm.editGame     = { id: game.id, name: '', genreId: null, price: null, releaseDate: '' };
      showModal('editGameModal');
      ApiService.getGame(game.id)
        .then(function (data) {
          vm.editGame = {
            id:          data.id,
            name:        data.name,
            genreId:     data.genreId,
            price:       data.price,
            releaseDate: formatDate(data.releaseDate)
          };
        })
        .catch(function (err) { vm.editErrorMsg = err; });
    };

    vm.submitEdit = function (form) {
      if (form.$invalid) {
        form.$setSubmitted();
        return;
      }
      vm.isSaving     = true;
      vm.editErrorMsg = null;

      ApiService.updateGame(vm.editGame.id, {
        name:        vm.editGame.name,
        genreId:     parseInt(vm.editGame.genreId, 10),
        price:       parseFloat(vm.editGame.price),
        releaseDate: formatDate(vm.editGame.releaseDate)
      })
        .then(function () {
          hideModal('editGameModal');
          vm.successMsg = '"' + vm.editGame.name + '" updated successfully!';
          loadGames();
          autoDismissSuccess();
        })
        .catch(function (err) { vm.editErrorMsg = err; })
        .finally(function ()  { vm.isSaving = false; });
    };

    vm.editFromDetails = function () {
      hideModal('detailsGameModal');
      $timeout(function () { vm.openEditModal(vm.selectedGame); }, 400);
    };

    // ── DELETE ────────────────────────────────────────────────────────────────
    vm.deleteGame = function (game) {
      if (!window.confirm('Delete "' + game.name + '"? This cannot be undone.')) { return; }
      vm.deletingId = game.id;
      ApiService.deleteGame(game.id)
        .then(function () {
          vm.successMsg = '"' + game.name + '" deleted.';
          vm.games = vm.games.filter(function (g) { return g.id !== game.id; });
          autoDismissSuccess();
        })
        .catch(function (err) { vm.errorMsg = err; })
        .finally(function ()  { vm.deletingId = null; });
    };

    // ── GENRES ────────────────────────────────────────────────────────────────
    vm.openGenresModal = function () {
      vm.genresError = null;
      showModal('genresModal');
      ApiService.getGenres()
        .then(function (data) { vm.genres = data; })
        .catch(function (err) { vm.genresError = err; });
    };

    // ── Init ──────────────────────────────────────────────────────────────────
    loadGames();
    loadGenres();
  }]);