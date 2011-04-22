/* Connects to REST server exposing iRods REST interface. */
jsfb.data.RestAdapter = Ext.extend(Object, {
    /* Get a file path as a url. */
    pathAsUrl: function(path) {
        var parts = path.split('/');
        var urlParts = [];
        Ext.each(parts, function(part) {
            if (part) {
                urlParts.push(encodeURIComponent(part));
            }
        });
        
        return urlParts.join('/');
    },

    /* Handle an API failure. */
    failure: function(config, response, opts) {
        var msg = 'Error';
        try {
            var r = Ext.decode(response.responseText);
            msg = r.message;
        } catch(e) {}

        config.failure(msg);
    },

    /* Login to the data provider. */
    login: function(config) {
        var auth = 'Basic ' + 
            Ext.util.base64.encode(config.user + ':' + config.password);
        
        // Set auth header on all future requests.
        Ext.Ajax.defaultHeaders = {
            'Authorization': 'Basic ' + 
                Ext.util.base64.encode(config.user + ':' + config.password)
        };

        // Leave off cache buster string
        Ext.Ajax.disableCaching = false;

        this.list(config);
    },

    /* Logout. */
    logout: function(config) {
        // Delete auth header.
        delete Ext.Ajax.defaultHeaders['Authorization'];

        if (config.success) {
            config.success();
        }
    },

    /* List the contents of a directory. */
    list: function(config) {
        var self = this;

        Ext.Ajax.request({
            url: config.url + '/io-v1/io/list/' + this.pathAsUrl(config.path) + '/',
            success: function(response, opts) {
                var r = Ext.decode(response.responseText);
                config.success(r.result);
            },
            failure:  function(response, opts) {
                self.failure(config, response, opts);
            }
        });
    },

    /* Create a new directory. */
    makeDir: function(config) {
        var self = this;

        Ext.Ajax.request({
            url: config.url + '/io-v1/io/' + this.pathAsUrl(config.path) + '/',
            params: {dirName: config.name, action: 'mkdir'},
            method: 'PUT',
            success: function(response, opts) {
                config.success();
            },
            failure:  function(response, opts) {
                self.failure(config, response, opts);
            }
        });
    },

    /* Rename a path. */
    renamePath: function(config) {
        var self = this;

        Ext.Ajax.request({
            url: config.url + '/io-v1/io/' + this.pathAsUrl(config.path) + '/',
            params: {newName: config.name, action: 'rename'},
            method: 'PUT',
            success: function(response, opts) {
                config.success();
            },
            failure:  function(response, opts) {
                self.failure(config, response, opts);
            }
        });
    },

    /* Delete a path. */
    deletePath: function(config) {
        var self = this;

        Ext.Ajax.request({
            url: config.url + '/io-v1/io/' + this.pathAsUrl(config.item.path) + '/',
            method: 'DELETE',
            success: function(response, opts) {
                config.success();
            },
            failure:  function(response, opts) {
                self.failure(config, response, opts);
            }
        });
    },

    /* Upload a file to the current directory. */
    upload: function(config) {
        // Can't upload via XmlHttpRequest,
        // Can't set auth headers via some other 
        console.log('not supported yet!');
    }
});
