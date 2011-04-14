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
    
    /* Login to the data provider. */
    login: function(config) {
        var auth = 'Basic ' + 
            Ext.util.base64.encode(config.user + ':' + config.password);
        
        // Set auth header on all future requests.
        /*Ext.Ajax.defaultHeaders = {
            'Authorization': 'Basic ' + 
                Ext.util.base64.encode(config.user + ':' + config.password)
        };
        
        config.log(Ext.Ajax.defaultHeaders);*/
        
        Ext.Ajax.request({
            url: config.url + '/io-v1/io/list/' + this.pathAsUrl(config.path) + '/',
            headers: {
                Authorization: auth
            },
            success: function(response, opts) {
                config.success(response.result);
            },
            failure:  function(response, opts) {
                config.failure(response.message);
            }
        });
    }
});