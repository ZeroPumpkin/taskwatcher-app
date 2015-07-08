angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, Tasklist, $ionicModal) {
  $scope.tasks = {};

  Tasklist.setRemoteDBSuffix('fmb');
  
  var doRefresh = function() {
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

  var statusMap = {
    'positive': ['Integrated'],
    'unknown': [''],
    'progress': ['Integration Test Running'],
    'negative': ['Integration Rejected (Eval)']
  };

  $scope.StatusHelper = function(mood, status) {
    return _.indexOf(statusMap[mood], status) != -1 || status == null && mood == 'unknown';
  };

  $scope.doSync = function() {
    Tasklist.sync().on('complete', function(info) {
      doRefresh();
      $scope.$broadcast('scroll.refreshComplete');
    }).on('error', function(err) {
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.addTask = function() {
    if (!Number.isInteger($scope.task.taskID)){
      console.log('specified task ID is not an integer', $scope.task.taskID);
      return;
    }

    $scope.task._id = $scope.task.taskID.toString();

    Tasklist.add($scope.task).then(function(res) {
      $scope.closeModal();
      doRefresh();
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
