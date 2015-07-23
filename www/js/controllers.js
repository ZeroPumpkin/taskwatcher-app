angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, Persist, Tasklist, $ionicModal, $ionicActionSheet) {
  $scope.tasks = {};

  Persist.setRemoteDBSuffix('fmb');
  
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

.controller('SettingsCtrl', function($scope, Persist) {
  $scope.settings = {
    autoWatch: false
  };

  $scope.getSettings = function() {
    Persist.getLocalDB().get('settings').then(function(doc) {
      $scope.$apply($scope.settings = doc);
      console.log('got settings', $scope.settings);
    }).catch(function(err) {
      console.log('error while getting settings', err);
    });
  };

  $scope.updateSettings = function() {
    console.log('updating settings', $scope.settings);
    Persist.getLocalDB().put($scope.settings, 'settings');
    Persist.sync().then(function(res) {
      console.log('settings sync was successful');
    }).catch(function(err) {
      console.log('error occurred during settings sync', err)
    });
    $scope.getSettings();
  };
});
