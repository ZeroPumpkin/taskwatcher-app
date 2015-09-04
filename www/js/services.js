angular.module('starter.services', [])

.factory('Persist', function() {
  var localDB = new PouchDB('taskwatcher');
  var remoteDB = null;

  var autoSync = null;

  return {
    setRemoteDBSuffix: function(suffix) {
      remoteDBSuffix = suffix;
      remoteDB = new PouchDB('http://www.zeropumpkin.iriscouch.com/taskwatcher-' + suffix);
    },

    getLocalDB: function() {
      if (!localDB) console.error('localDB is not defined');
      return localDB;
    },

    getRemoteDB: function() {
      if (!remoteDB) console.error('remoteDB is not defined');
      return remoteDB;
    },

    sync: function() {
      return localDB.sync(remoteDB);
    },

    startAutoSync: function(callback) {
      if (autoSync) {
        console.error('autoSync is already running');
        return;
      }

      autoSync = localDB.sync(remoteDB, {
        live: true,
        retry: true
      }).on('change', function(info) {
        // handle change
        callback(info);
      }).on('paused', function () {
        // replication paused (e.g. user went offline)
      }).on('active', function () {
        // replicate resumed (e.g. user went back online)
      }).on('denied', function (info) {
        // a document failed to replicate, e.g. due to permissions
      }).on('complete', function (info) {
        // handle complete
      }).on('error', function (err) {
        // handle error
      });
    },

    stopAutoSync: function() {
      if (autoSync != null) {
        autoSync.cancel();
        autoSync = null;
      }
    }
  };
})

.factory('Tasklist', function(Persist) {
  return {
    get: function() {
      /*return Persist.getLocalDB().allDocs({
        include_docs: true
      });*/
      return Persist.getLocalDB().query('tasks/tasks', { include_docs: true });
    },

    add: function(task) {
      return Persist.getLocalDB().put(task);
    },

    delete: function(task) {
      return Persist.getLocalDB().remove(task);
    }
  }
})

.factory('Settings', function(Persist) {
  return {
    getSettings: function() {
      return Persist.getLocalDB().get('settings').then(function(doc) {
        console.log('got settings', doc);
        return doc;
      }).catch(function(err) {
        console.log('error while getting settings', err);
      });
    },

    updateSettings: function(settings) {
      console.log('updating settings', settings);
      Persist.getLocalDB().put(settings, 'settings');
      Persist.sync().then(function(res) {
        console.log('settings sync was successful');
      }).catch(function(err) {
        console.log('error occurred during settings sync', err)
      });
    }
  }
});