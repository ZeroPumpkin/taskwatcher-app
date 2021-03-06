angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, Persist, Tasklist, $ionicModal, $ionicActionSheet, Settings) {
  $scope.tasks = {};

  Persist.setRemoteDBSuffix('fmb');

  $scope.init = function() {
    Settings.getSettings().then(function(settings) {
      if (settings.autoSync) {
        Persist.startAutoSync($scope.autoSyncHandler);
      }
    });
  };

  $scope.autoSyncHandler = function(info) {
    $scope.doRefresh();
  };
  
  $scope.doRefresh = function() {
    Tasklist.get().then(function(res) {
      var tasks = {};
      console.log(res);
      _.map(res.rows, function(row) {
        tasks[row.id] = row.doc;
      });

      console.log('After mapping', tasks);

      $scope.$apply($scope.tasks = tasks);
    }).catch(function(err) {
      console.log(err);
    });
  };

  var statusClassMap = {
    'item-icon ion-checkmark-circled balanced': ['Integrated'],
    'item-icon ion-load-b positive': ['Integration Test Running'],
    'item-icon ion-alert-circled assertive': ['Integration Rejected (Eval)', 'Integration Rejected']
  };

  $scope.StatusHelper = function(status, isHeader) {
    var classes = "";
    var classMap = null;

    classes = "item-icon ion-help-circled energized"; // Default
    classMap = statusClassMap;

    _.each(classMap, function(value, key, list) {
      if (_.indexOf(value, status) != -1) classes = key;
    });

    return classes;
  };

  $scope.doSync = function() {
    Persist.sync().on('complete', function(info) {
      $scope.doRefresh();
      $scope.$broadcast('scroll.refreshComplete');
    }).on('error', function(err) {
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.showActions = function(task) {
    // Show the action sheet
    var hideSheet = $ionicActionSheet.show({
      buttons: [],
      destructiveText: 'Stop Watching',
      titleText: 'Task Actions',
      cancelText: 'Cancel',
      destructiveButtonClicked: function() {
        Tasklist.delete(task).then(function(result) {
          $scope.doRefresh();
          $scope.doSync();
        });

        return true;
      }
    });
  }

  $scope.addTask = function() {
    if (!Number.isInteger($scope.task.taskID)){
      console.log('specified task ID is not an integer', $scope.task.taskID);
      return;
    }

    $scope.task._id = $scope.task.taskID.toString();
    $scope.task.$doctype = 'adaiTask';

    Tasklist.add($scope.task).then(function(res) {
      $scope.closeModal();
      $scope.doRefresh();
      $scope.doSync();
    }).catch(function(err) {
      console.log(err);
    });
  }

  $ionicModal.fromTemplateUrl('add-task-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.task = {};
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
})

.controller('SettingsCtrl', function($scope, Persist, Settings, $timeout) {
  $scope.settings = {
    autoWatch: false
   ,autoSync:  false
  };

  $scope.getSettings = function() {
    Settings.getSettings().then(function(settings) {
      console.debug('settings obj', settings);
      $timeout(function() {
        $scope.$apply($scope.settings = settings);
      }, 0);
    });
  };

  $scope.updateSettings = function() {
    Settings.updateSettings($scope.settings);
    $scope.getSettings();
  };
});
