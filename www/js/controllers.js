angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, Tasklist, $ionicModal, $ionicActionSheet) {
  $scope.tasks = {};

  Tasklist.setRemoteDBSuffix('fmb');
  
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
    // 'item-icon ion-help-circled energized': [''],
    'item-icon ion-load-b positive': ['Integration Test Running'],
    'item-icon ion-alert-circled assertive': ['Integration Rejected (Eval)', 'Integration Rejected']
  };

  // var headerClassMap = {
  //   'assertive': ['Integration Rejected (Eval)', 'Integration Rejected']
  // }

  $scope.StatusHelper = function(status, isHeader) {
    var classes = "";
    var classMap = null;

    if (isHeader) {
      // classes = ""; // Default
      // classMap = headerClassMap;
    }
    else {
      classes = "item-icon ion-help-circled energized"; // Default
      classMap = statusClassMap;
    }

    _.each(classMap, function(value, key, list) {
      if (_.indexOf(value, status) != -1) classes = key;
    });

    return classes;
  };

  $scope.doSync = function() {
    Tasklist.sync().on('complete', function(info) {
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

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
