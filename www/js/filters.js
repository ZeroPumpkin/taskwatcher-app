angular.module('starter.filters', [])

.filter('taskHeader', function() {
  return function(task) {
    if (task.TaskName == null) {
      return task.TaskID;
    }
    else {
      return task.TaskName + ' (' + task.TaskID + ')';
    }
  };
})