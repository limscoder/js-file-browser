/**
 * This container is the parent for all other widgets.
 */
jsfb.widgets.Browser = Ext.extend(Ext.Panel, {
    constructor: function(config) {
        // set defaults
        var defaults = {
            title: 'JS File Browser',
            height: 400,
            width: 600,
            url: '',
            path: '/',
            layout: 'fit'
        }
        Ext.apply(defaults, config);
        
        if (!defaults.fileAdapter) {
            defaults.fileAdapter = new jsfb.data.RestAdapter();
        }
        
        // init instance.
        Ext.apply(this, defaults);
        jsfb.widgets.Browser.superclass.constructor.apply(this, arguments);
        
        // show login screen
        this.logout();
    },
    
    /* Displays a message in the browser area. */
    showMessage: function(params) {
        var defaults = {
            msg: '',
            cls: '',
            showClose: true,
            timeout: 7000
        };
        Ext.apply(defaults, params);
        
        // Get container div
        if (!this.msgContainer) {
            var panelHeader = Ext.query('.x-panel-body', this.el.dom)[0];
            this.msgContainer = Ext.DomHelper.append(panelHeader, {
                tag: 'div',
                cls: 'message-container'
            });
        }
        
        // Add message
        var cls = 'message ' + defaults.cls;
        var message = Ext.DomHelper.append(this.msgContainer, {
            tag: 'div',
            cls: cls,
            children: [
                {
                    tag: 'span',
                    cls: 'message-text',
                    html: defaults.msg
                }
            ]
        });
        var msg = Ext.get(message);
        msg.close = function() {
            this.remove();
        }
        
        if (defaults.showClose) {
            var closeBtn = Ext.DomHelper.append(message, {
                tag: 'div',
                cls: 'message-close'
            });
            
            Ext.get(closeBtn).on('click', function() {
                msg.close();
            });
        };
        
        if (defaults.timeout) {
            setTimeout(function() {msg.close()}, defaults.timeout);
        }
        
        return msg;
    },
    
    /* Display an error message to users. */
    showError: function(msg) {
        this.showMessage({
            msg: msg? msg:'System Error',
            cls: 'error'
        });
    },
    
    /* Display a loading message to users. */
    showLoading: function(msg) {
        var panelBody = Ext.query('.x-panel-body', this.el.dom)[0];
        Ext.DomHelper.append(panelBody, {
            tag: 'div',
            cls: 'busy'
        });
        
        this.showMessage({
            msg: msg? msg:'Waiting...',
            cls: 'load',
            showClose: false,
            timeout: 0
        });
    },
    
    /* Hide loading message. */
    hideLoading: function() {
        var busy = Ext.query('.busy', this.el.dom);
        if (busy.length) {
            Ext.get(busy[0]).remove();
        }
        
        var msg = Ext.query('.load', this.el.dom);
        if (msg.length) {
            Ext.get(msg[0]).close();
        }
    },
    
    /* Get generic config object for passing to API. */
    getApiConfig: function() {
        return {
            user: this.user,
            password: this.password,
            url: this.url,
            path: this.path
        };
    },
    
    /* Get generic config object with success callback for passing to API. */
    getApiCallConfig: function(callback) {
        var self = this;
        var config = this.getApiConfig();
        Ext.apply(config, {
            success: function(data) {
                callback(data);
                self.hideLoading();
            },
            failure: function(msg) {
                self.hideLoading();
                self.showError(msg);
            }
        });
        
        return config;
    },
    
    /* Login to the API. */
    login: function() {
        var self = this;
        var config = this.getApiCallConfig(function(data) {
            self.loggedIn = true;
            self.setData(data);
        });
        
        this.showLoading();
        this.fileAdapter.login(config);
    },
    
    /* Logout of the API. */
    logout: function() {
        var self = this;
        
        // Logout from API
        if (this.loggedIn) {
            var config = this.getApiCallConfig(function(data) {
                self.loggedIn = false;
                self.setData(data);
            });
            
            this.showLoading();
            this.fileAdapter.logout(config);
        }
        
        // Init login screen
        if (!this.loginWidget) {
            this.removeAll();
            this.loginWidget = this.add({
                layout: 'ux.center',
                border: false,
                items: [{
                    xtype: 'jsfblogin',
                    user: this.user,
                    password: this.password,
                    url: this.url,
                    path: this.path,
                    listeners: {
                        login: function(src, params) {
                            Ext.apply(self, params);
                            self.login();
                        }
                    }
                }]
            });
        } else {
            if (this.items.indexOf(this.loginWidget) < 0) {
                this.removeAll();
                this.add(this.loginWidget);
            }
        }
        this.doLayout();
    },
    
    /* Change path. */
    changePath: function(path) {
        console.log('Changing path to: ' + path);
        
        var self = this;
        this.path = path;
        
        var config = this.getApiCallConfig(function(data) {
            self.setData(data);
        });
        
        this.showLoading();
        this.fileAdapter.list(config);
    },
    
    /* Create a new directory. */
    makeDir: function(name) {
        var self = this;
        
        var config = this.getApiCallConfig(function() {
            // Refresh content
            self.changePath(self.path);
        });
        config.name = name;
        
        this.showLoading();
        this.fileAdapter.makeDir(config);
    },
    
    /* Rename a path. */
    renamePath: function(name, item) {
        var self = this;
        var oldName = item.name;
        
        var config = this.getApiCallConfig(function() {
            
            if (Ext.isArray(self.data)) {
                self.changePath(self.path);
            } else {
                var re = new RegExp(oldName+ '$');
                var path = item.path.replace(re, name);
                self.changePath(path);
            }
        });
        config.item = item;
        config.newName = name;
        
        this.showLoading();
        this.fileAdapter.renamePath(config);
    },
    
    /* Delete a path. */
    deletePath: function(item) {
        var self = this;
        
        var config = this.getApiCallConfig(function() {
            if (Ext.isArray(self.data)) {
                self.changePath(self.path);
            } else {
                var parts = item.path.split('/');
                self.changePath('/' + parts.splice(parts.length - 1, 1).join('/'));
            }
        });
        config.item = item
        
        this.showLoading();
        this.fileAdapter.deletePath(config);
    },
    
    /* Update directory listing data. */
    setData: function(data) {
        var self = this;
        
        // init file browser
        if (!this.fileGrid) {
            this.removeAll();
            this.fileGrid = this.add({
                ref: 'fileGrid',
                xtype: 'jsfbfilegrid',
                border: false,
                listeners: {
                    pathchange: function(src, path) {
                        self.changePath(path);
                    },
                    makedir: function(src, name) {
                        self.makeDir(name);
                    },
                    renamepath: function(src, name, item) {
                        self.renamePath(name, item);
                    },
                    deletepath: function(src, item) {
                        self.deletePath(item);
                    }
                }
            });
            
            // Listen for item selection!!
            this.fileGrid.getSelectionModel().on('rowselect', function(row, idx, rowData) {
                if (self.callback) {
                    var config = self.getApiConfig();
                    Ext.apply(config, rowData.data);
                    self.callback.call(self, config);
                }
            });
        } else {
            if (this.items.indexOf(this.fileGrid) < 0) {
                this.add(this.fileGrid);
            }
        }
        
        // render and set data
        this.doLayout();
        this.fileGrid.setData(this.path, data);
        
        // Force grid re-render!
        this.fileGrid.getView().render();
        this.fileGrid.getView().refresh();
    }
});

Ext.reg('jsfbbrowser', jsfb.widgets.Browser);
