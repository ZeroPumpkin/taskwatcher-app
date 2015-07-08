angular.module('starter.filters', [])

.filter('taskHeader', function() {
  return function(task) {
    if (task.taskName == null) {
      return task.taskID;
    }
    else {
      return task.taskID + ': ' + task.taskName;
    }
  };
})