/*!
 * js-file-browser
 * Copyright(c) 2011 Biotechnology Computing Facility, University of Arizona. See included LICENSE.txt file.
 * 
 * With components from: Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
/*!
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
// We are adding these custom layouts to a namespace that does not
// exist by default in Ext, so we have to add the namespace first:
Ext.ns('Ext.ux.layout');

/**
 * @class Ext.ux.layout.CenterLayout
 * @extends Ext.layout.FitLayout
 * <p>This is a very simple layout style used to center contents within a container.  This layout works within
 * nested containers and can also be used as expected as a Viewport layout to center the page layout.</p>
 * <p>As a subclass of FitLayout, CenterLayout expects to have a single child panel of the container that uses
 * the layout.  The layout does not require any config options, although the child panel contained within the
 * layout must provide a fixed or percentage width.  The child panel's height will fit to the container by
 * default, but you can specify <tt>autoHeight:true</tt> to allow it to autosize based on its content height.
 * Example usage:</p>
 * <pre><code>
// The content panel is centered in the container
var p = new Ext.Panel({
    title: 'Center Layout',
    layout: 'ux.center',
    items: [{
        title: 'Centered Content',
        width: '75%',
        html: 'Some content'
    }]
});

// If you leave the title blank and specify no border
// you'll create a non-visual, structural panel just
// for centering the contents in the main container.
var p = new Ext.Panel({
    layout: 'ux.center',
    border: false,
    items: [{
        title: 'Centered Content',
        width: 300,
        autoHeight: true,
        html: 'Some content'
    }]
});
</code></pre>
 */
Ext.ux.layout.CenterLayout = Ext.extend(Ext.layout.FitLayout, {
	// private
    setItemSize : function(item, size){
        this.container.addClass('ux-layout-center');
        item.addClass('ux-layout-center-item');
        if(item && size.height > 0){
            if(item.width){
                size.width = item.width;
            }
            item.setSize(size);
        }
    }
});

Ext.Container.LAYOUTS['ux.center'] = Ext.ux.layout.CenterLayout;
// Setup app namespaces
Ext.ns('jsfb', 'jsfb.data', 'jsfb.widgets');/**
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

        if (!defaults.dataFormatter) {
            defaults.dataFormatter = new jsfb.data.DataFormatter();
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
            success: function() {
                callback.apply(this, arguments);
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
        var self = this;
        this.path = path;
        console.log('Changed Path: ' + this.path);
        
        var config = this.getApiCallConfig(function(data) {
            console.log('Got Data!');
            console.log(data);
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
        config.name = name;
        
        this.showLoading();
        this.fileAdapter.renamePath(config);
    },
    
    /* Delete a path. */
    deletePath: function(item) {
        var self = this;
        
        var config = this.getApiCallConfig(function() {
            self.changePath(self.path);
        });
        config.item = item
        
        this.showLoading();
        this.fileAdapter.deletePath(config);
    },

    /* Upload a file to the current directory. */
    upload: function(form) {
        var self = this;

        var config = this.getApiCallConfig(function() {
            self.changePath(self.path);
        });
        config.form = form

        this.showLoading();
        this.fileAdapter.upload(config);
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
                    removepath: function(src, item) {
                        self.deletePath(item);
                    },
                    upload: function(form) {
                        self.upload(form);
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

        if (Ext.isArray(data)) {
            Ext.each(data, function(item) {
                self.dataFormatter.format(item);
            });
        } else {
            this.dataFormatter.format(data);
        }
        this.fileGrid.setData(this.path, data);
        
        // Force grid re-render!
        this.fileGrid.getView().render();
        this.fileGrid.getView().refresh();
    }
});

Ext.reg('jsfbbrowser', jsfb.widgets.Browser);
/**
 * Displays file/directory details.
 */
jsfb.widgets.FileDetailPanel = Ext.extend(Ext.Panel, {
    constructor: function(config) {
        var self = this;

        if (!config.data) {
            // A file object to render must be specified.
            throw new Error('Attribute: "data" not specified.');
        }

        // HTML to render within panel 
        var props = [
            {label: 'File', attr: 'name'},
            {label: 'Path', attr: 'path'},
            {label: 'Owner', attr: 'owner'},
            {label: 'Modified', attr: 'modified'},
            {label: 'Permissions', attr: 'permissions'},
            {label: 'Size', attr: 'size'},
            {label: 'File Type', attr: 'type'},
            {label: 'Mime Type', attr: 'mimeType'},
            {label: 'Download', attr: 'download'}
        ];

        var html = '<table class="dl"><tbody>';
        Ext.each(props, function(item) {
            if (config.data.hasOwnProperty(item.attr) && config.data[item.attr]) {
                html += '<tr><th>' + item.label + ':</th><td>{' +
                    item.attr + '}</td></tr>';
            }
        });
        html += '</tbody></table>';
        var tpl = new Ext.Template(html);

        defaults = {
            border: false,
            frame: false,
            height: 320,
            layout: 'fit',
            html: tpl.apply(config.data),
            bbar: [
               {
                   xtype: 'button',
                   text: 'Rename',
                   disabled: config.data.writable? false:true,
                   icon: 'jsfb/resources/images/document-rename.png',
                   listeners: {
                       render: function(item, e) {
                           new Ext.ToolTip({
                               target: item.el,
                               title: 'Rename ' + config.data.type +'.'
                           });
                       },
                       click: function(item, e) {
                           // Show rename file window.
                           var win = new Ext.Window({
                               renderTo: self.el,
                               title: 'Rename',
                               width: 300,
                               padding: 10,
                               resizable: false,
                               layout: 'form',
                               items: [
                                   {
                                       xtype: 'form',
                                       ref: 'renameForm',
                                       unstyled: true,
                                       padding: 5,
                                       items: [
                                           {
                                               xtype: 'textfield',
                                               width: 150,
                                               fieldLabel: 'Name',
                                               name: 'name',
                                               value: config.data.name,
                                               allowBlank: false
                                           }
                                       ]
                                   }
                               ],
                               bbar: [
                                  {
                                      xtype: 'button',
                                      text: 'Rename',
                                      icon: 'jsfb/resources/images/document-rename.png',
                                      handler: function() {
                                          var form = win.renameForm.getForm();
                                          if (form.isValid()) {
                                              self.fireEvent('renamepath', self, form.getFieldValues().name, self.data);
                                              win.close();
                                          }
                                      }
                                  },
                                  '&nbsp;',
                                  {
                                      xtype: 'button',
                                      text: 'Cancel',
                                      icon: 'jsfb/resources/images/close.png',
                                      handler: function() {
                                          win.close();
                                      }
                                  }
                               ]
                           });
                           win.show();
                       }
                   }
               },
               '&nbsp;',
               {
                   xtype: 'button',
                   text: 'Delete',
                   icon: 'jsfb/resources/images/document--minus.png',
                   disabled: config.data.writable? false:true,
                   listeners: {
                       render: function(item, e) {
                           new Ext.ToolTip({
                               target: item.el,
                               title: 'Delete ' + config.data.type +'.'
                           });
                       },
                       click: function(item, e) {
                           // Show delete file window.
                           var win = new Ext.Window({
                               renderTo: self.el,
                               title: 'Delete ' + config.data.path + '?',
                               width: 300,
                               padding: 10,
                               resizable: false,
                               html: 'Permanently delete ' + config.data.name +
                                   (config.data.type === 'dir'? ' and all children':'') + '?',
                               bbar: [
                                  {
                                      xtype: 'button',
                                      text: 'Cancel',
                                      icon: 'jsfb/resources/images/check.png',
                                      handler: function() {
                                          win.close();
                                      }
                                  },
                                  '&nbsp;',
                                  {
                                      xtype: 'button',
                                      text: 'Delete',
                                      icon: 'jsfb/resources/images/close.png',
                                      handler: function() {
                                          self.fireEvent('removepath', self, self.data);
                                          win.close();
                                      }
                                  },
                               ]
                           });
                           win.show();
                       }
                   }
               }
            ]
        };

        // init instance
        Ext.apply(defaults, config);
        Ext.apply(this, defaults);
        jsfb.widgets.FileDetailPanel.superclass.constructor.apply(this, arguments);

        // set custom events
        self.addEvents('renamepath', 'removepath');
    }

});

Ext.reg('jsfbfiledetailpanel', jsfb.widgets.FileDetailPanel);


/**
 * Displays individual directories and files.
 */
jsfb.widgets.FileGrid = Ext.extend(Ext.grid.GridPanel, {
    constructor: function(config) {
        var self = this;
        
        // set defaults
        var defaults = {
            viewConfig: {forceFit: true},
            frame: false,
            border: false,
            autoExpandColumn: 'name',
            autoHeight: false,
            columnLines: true,
            stripeRows: true,
            showHidden: false,
            cls: 'file-grid',
            tbar: {
                style: 'padding-left: 5px',
                items: []
            },
            bbar: {
                style: 'padding-left: 5px',
                items: [
                    '<span class="label">Filter By:</span>&nbsp;',
                    {
                        id: 'fileFilterInput',
                        xtype: 'textfield',
                        value: config && config.filter? config.filter:undefined,
                        enableKeyEvents: true,
                        listeners: {
                            render: function(item, e) {
                                new Ext.ToolTip({
                                    target: item.el,
                                    title: 'Filter files by name.'
                                });
                            },
                            keydown: function(item, e) {
                                // Wait before filtering
                                var delay = 500;
                                
                                // Avoid calling filter multiple
                                // times for a single entry.
                                var token = {};
                                
                                self.filterFunc = setTimeout(function() {
                                    if (token.filterFunc === self.filterFunc) {
                                        self.filterData();
                                    }
                                }, delay);
                                token.filterFunc = self.filterFunc;
                            }
                        }
                    },
                    '&nbsp;&nbsp;',
                    {
                        xtype: 'button',
                        ref: 'goToParentBtn',
                        icon: 'jsfb/resources/images/folder-horizontal--arrow-90.png',
                        listeners: {
                            render: function(item, e) {
                                new Ext.ToolTip({
                                    target: item.el,
                                    title: 'Go to parent directory.'
                                });
                            },
                            click: function(item, e) {
                                var parts = self.getPathAsArray();
                                var path = '/' + parts.slice(1, parts.length - 1).join('/');
                                self.fireEvent('pathchange', self, path);
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        ref: 'reloadBtn',
                        icon: 'jsfb/resources/images/folder-horizontal--arrow-315.png',
                        listeners: {
                            render: function(item, e) {
                                new Ext.ToolTip({
                                    target: item.el,
                                    title: 'Refresh content.'
                                });
                            },
                            click: function(item, e) {
                                self.fireEvent('pathchange', self, self.path);
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        ref: 'makeDirBtn',
                        icon: 'jsfb/resources/images/folder-horizontal--plus.png',
                        listeners: {
                            render: function(item, e) {
                                new Ext.ToolTip({
                                    target: item.el,
                                    title: 'Create new directory.'
                                });
                            },
                            click: function(item, e) {
                                // Show create directory window.
                                var win = new Ext.Window({
                                    renderTo: self.el,
                                    title: 'New Directory',
                                    width: 300,
                                    padding: 10,
                                    resizable: false,
                                    layout: 'form',
                                    items: [
                                        {
                                            xtype: 'form',
                                            ref: 'makeDirForm',
                                            unstyled: true,
                                            padding: 5,
                                            items: [
                                                {
                                                    xtype: 'textfield',
                                                    width: 150,
                                                    fieldLabel: 'Name',
                                                    name: 'name',
                                                    allowBlank: false
                                                }
                                            ]
                                        }
                                    ],
                                    bbar: [
                                       {
                                           xtype: 'button',
                                           text: 'Create',
                                           icon: 'jsfb/resources/images/folder-horizontal--plus.png',
                                           handler: function() {
                                               var form = win.makeDirForm.getForm();
                                               if (form.isValid()) {
                                                   self.fireEvent('makedir', self, form.getFieldValues().name);
                                                   win.close();
                                               }
                                           }
                                       },
                                       '&nbsp;',
                                       {
                                           xtype: 'button',
                                           text: 'Cancel',
                                           icon: 'jsfb/resources/images/close.png',
                                           handler: function() {
                                               win.close();
                                           }
                                       }
                                    ]
                                });
                                win.show();
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        ref: 'uploadBtn',
                        icon: 'jsfb/resources/images/document--plus.png',
                        listeners: {
                            render: function(item, e) {
                                new Ext.ToolTip({
                                    target: item.el,
                                    title: 'Upload file.'
                                });
                            },
                            click: function(item, e) {
                                // Show upload file window.
                                var win = new Ext.Window({
                                    renderTo: self.el,
                                    title: 'Upload File',
                                    width: 300,
                                    padding: 10,
                                    resizable: false,
                                    layout: 'form',
                                    items: [
                                        {
                                            xtype: 'form',
                                            ref: 'uploadForm',
                                            fileUpload: true,
                                            unstyled: true,
                                            padding: 5,
                                            html: 'Not Implemented yet!',
                                            /*items: [
                                                {
                                                    xtype: 'fileuploadfield',
                                                    width: 150,
                                                    fieldLabel: 'File',
                                                    name: 'file',
                                                    allowBlank: false
                                                }
                                            ]*/
                                        }
                                    ],
                                    bbar: [
                                       {
                                           xtype: 'button',
                                           text: 'Upload',
                                           icon: 'jsfb/resources/images/document--plus.png',
                                           handler: function() {
                                               var form = win.uploadForm.getForm();
                                               if (form.isValid()) {
                                                   self.fireEvent('upload', self, form);
                                                   win.close();
                                               }
                                           }
                                       },
                                       '&nbsp;',
                                       {
                                           xtype: 'button',
                                           text: 'Cancel',
                                           icon: 'jsfb/resources/images/close.png',
                                           handler: function() {
                                               win.close();
                                           }
                                       }
                                    ]
                                });
                                win.show();
                            }
 
                        }
                    }
                ]
            }
        };
        Ext.apply(defaults, config);
        
        if (!defaults.store) {
            defaults.store = new Ext.data.JsonStore({
                storeId: 'dirListing',
                autoDestroy: true,
                root: 'files',
                idProperty: 'path',
                fields: [
                    'name',
                    'path',
                    {
                        name: 'lastModified',
                        type: 'date',
                        dateFormat: 'time'
                    },
                    'length',
                    'owner',
                    'permissions',
                    'mimetype',
                    'modified',
                    'size',
                    'type',
                    'writable'
                ]
            });
        };
        
        if (!defaults.colModel) {
            defaults.colModel = new Ext.grid.ColumnModel({
                defaults: {sortable: true},
                columns: [
                    {
                        id: 'name',
                        header: 'Filename',
                        dataIndex: 'name',
                        renderer: function(val, metadata, item) {
                            // Add icon and link
                            var icon = self.getIcon(item.data);
                            var style = 'background-image: url(jsfb/resources/images/' + icon + ');'
                            return '<div class="filename" style="' + style + '">' + val + '</div>';
                        }
                    },
                    {
                        header: 'Status',
                        dataIndex: 'permissions',
                        width: 20,
                        renderer: function(val, metadata, item) {
                            return self.getFileStatus(item.data);
                        }
                    },
                    {
                        header: 'Size',
                        dataIndex: 'size',
                        width: 35,
                    },
                    {
                        header: 'Modified',
                        dataIndex: 'modified',
                        width: 75
                    }
                ]
            });
        }
        
        // init instance
        Ext.apply(this, defaults);
        jsfb.widgets.FileGrid.superclass.constructor.apply(this, arguments);
        
        this.on('rowdblclick', function(grid, rowIdx, e) {
            var record = self.getStore().getAt(rowIdx);
            if (record.data.type === 'dir') {
                self.fireEvent('pathchange', self, record.data.path);
            } else {
                self.setData(record.data.path, record.data);
            }
        });
        
        // set custom events
        this.addEvents('pathchange', 'makedir', 'renamepath', 'removepath', 'upload');
    },
    
    /* Get the current path as an array. */
    getPathAsArray: function() {
        return this.path.split('/');
    },
    
    /* Set data being presented in the browser. */
    setData: function(path, data) {
        // Display file data
        this.path = path;
        this.data = data;
        this.updateLocation();
        
        if (Ext.isArray(data)) {
            this.filterData();
            this.disableControls(data);
        } else {
            this.fileDetails();
        }
    },

    /* Determine which controls should be enabled/disabled. */
    disableControls: function(data) {
        var bb = this.getBottomToolbar();
        if (data && data[0].writable) {
            bb.makeDirBtn.enable();
            bb.uploadBtn.enable();
        } else {
            bb.makeDirBtn.disable();
            bb.uploadBtn.disable();
        }

        if (data && this.getPathAsArray().length > 1) {
            bb.goToParentBtn.enable();
        } else {
            bb.goToParentBtn.disable();
        }
    },
    
    /* Update the location bar. */
    updateLocation: function(path) {
        var self = this;
        
        // Remove all existing path buttons
        var tb = this.getTopToolbar();
        tb.removeAll();
        
        // Add new path buttons.
        var parts = this.getPathAsArray();
        Ext.each(parts, function(item, idx) {
            if (item === '') {
                return;
            }
            
            if (item.length > 15) {
                // Use ellipsis to reduce label length
                item = item.substr(0, 9) + '...' + item.substr(item.length - 3, 3);
            }
            
            var path = parts.slice(0, idx + 1).join('/');
            tb.add({
                xtype: 'button',
                text: item,
                minWidth: 20,
                listeners: {
                    render: function(item, e) {
                        new Ext.ToolTip({
                            target: item.el,
                            title: 'Go to: ' + path
                        });
                    },
                    click: function(item, e) {
                        self.fireEvent('pathchange', self, path);
                    }
                }
            });
            
            tb.add('&nbsp;');
        });
    },
    
    /* Display filtered data in grid. */
    filterData: function() {
        var self = this;
        var patterns = Ext.get('fileFilterInput').getValue().split(/,|\s/);
        
        var regex;
        if (patterns) {
            var cleanPatterns = [];
            Ext.each(patterns, function(item) {
                item = item.replace('.', '\\.');
                item = item.replace(/^\s+|\s+$/g, '');
                cleanPatterns.push(item);
            });
            
            regex = new RegExp(cleanPatterns.join('|'), 'i');
        }
        
        var filtered = [];
        Ext.each(this.data, function(item) {
            if (!item) {
                return;
            }
            
            if ((!this.showHidden) && item.name.indexOf('.') === 0) {
                return;
            }
            
            if (regex && (!regex.test(item.name))) {
                return;
            }
            
            filtered.push(item);
        });

        this.store.loadData({files: filtered});
    },
    
    /* Return a file name to use as a file's icon. */
    getIcon: function(item) {
        var icon;
        if (item.type === 'dir') {
            icon = this.getDirIcon(item);
        } else if (item.type === 'file') {
            icon = this.getFileIcon(item);
        } else {
            icon = 'document.png';
        }
        
        return icon;
    },
    
    /* Return a file name to use as a directory's icon. */
    getDirIcon: function(item) {
        return 'folder-horizontal.png';
    },
    
    /* Return a file name to use as a file's icon. */
    getFileIcon: function(item) {
        var iconMap = {
            'fasta': 'document-dna.png',
            'fa': 'document-dna.png',
            'fastq': 'document-dna.png',
            'fq': 'document-dna.png',
            'txt': 'document-text.png',
            'rtf': 'document-text.png',
            'csv': 'document-table.png',
            'xls': 'document-excel-table.png',
            'doc': 'document-word-text.png',
            'ppt': 'document-powerpoint.png',
            'pdf': 'document-pdf.png',
            'html': 'document-xaml.png',
            'xml': 'document-code.png',
            'png': 'image.png',
            'gif': 'image.png',
            'tiff': 'image.png',
            'jpg': 'image.png',
            'jpeg': 'image.png'
        }
        
        var parts = item.name.split('.');
        if (parts.length) {
            var ext = parts[parts.length - 1];
            if (iconMap.hasOwnProperty(ext)) {
                return iconMap[ext];
            }
        }
        
        return 'document.png';
    },
    
    /* Return an html snipprt to represent the current status. */
    getFileStatus: function(item) {
        var html = '<div class="file-status">';
        
        // Permission icon
        if (item.writable) {
            html += '<div style="background-image: url(jsfb/resources/images/lock-unlock.png);"></div>';
        } else {
            html += '<div style="background-image: url(jsfb/resources/images/lock.png);"></div>';
        }
        
        // Sharing icon
        //html += '<div style="background-image: url(jsfb/resources/images/users.png);"></div>';
        
        // Info icon
        var infoClick = "var fb = Ext.getCmp('" + this.id + "'); fb.pathDetails('" +
            item.path + "'); return false;";
        html += '<a onclick="' + infoClick + '"><div style="background-image: url(jsfb/resources/images/information-frame.png);"></div></a>';
        
        html += '</div>';
        return html;
    },
    
    /* Display file details in browser window by specifying file path. */
    pathDetails: function(path) {
        for (var i = 0; i < this.data.length; i++) {
            var item = this.data[i];
            if (item.path === path) {
                this.setData(item.path, item);
                break;
            }
        }
    },
    
    /* Display file details in browser window. */
    fileDetails: function() {
        var self = this;

        // Hide grid
        var gridContainer = Ext.query('.x-panel-body', this.el.dom)[0];
        gridContainer.innerHTML = '';
       
        // Render details 
        var fileDetails = new jsfb.widgets.FileDetailPanel({
            renderTo: gridContainer,
            data: this.data,
            listeners: {
                renamepath: function(src, name, data) { 
                    self.fireEvent('renamepath', self, name, data);
                },
                removepath: function(src, data) {
                    self.fireEvent('removepath', self, data);
                }
            }
        });

        // Disable directory controls.
        this.disableControls();
    }
});

Ext.reg('jsfbfilegrid', jsfb.widgets.FileGrid);
jsfb.widgets.Login = Ext.extend(Ext.FormPanel, {
    constructor: function(config) {
        var self = this;
        
        // set defaults
        var defaults = {
            title: 'Login',
            width: 400,
            autoHeight: true,
            padding: 10,
            cls: 'login',
            items: [
                {
                    xtype: 'textfield',
                    width: 250,
                    fieldLabel: 'User',
                    name: 'user',
                    allowBlank: false,
                    value: config && config.user? config.user:undefined
                },
                {
                    xtype: 'textfield',
                    width: 250,
                    inputType: 'password',
                    fieldLabel: 'Password',
                    name: 'password',
                    allowBlank: false,
                    value: config && config.password? config.password:undefined
                },
                {
                    xtype: 'textfield',
                    width: 250,
                    fieldLabel: 'Server',
                    name: 'url',
                    allowBlank: false,
                    value: config && config.url? config.url:undefined
                }
            ],
            bbar: [
               {
                   xtype: 'button',
                   text: 'Login',
                   icon: 'jsfb/resources/images/door--arrow.png',
                   handler: function() {
                       self.login();
                   }
               }
            ]
        };
        Ext.apply(defaults, config);
        
        // init instance
        Ext.apply(this, defaults);
        jsfb.widgets.Login.superclass.constructor.apply(this, arguments);
        
        // set custom events
        this.addEvents('login');
    },
    
    login: function() {
        var form = this.getForm();
        if (form.isValid()) {
            var vals = form.getFieldValues();
            vals.path = vals.user;
            this.fireEvent('login', this, vals);
        }
    }
});

Ext.reg('jsfblogin', jsfb.widgets.Login);
/**
 * Use to encode/decode base64 data.
 * 
 * From: http://www.sencha.com/forum/showthread.php?35328-Ext.util.base64-(encode-decode)&p=167166
 */
Ext.util.base64 = {
    base64s : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    
    encode: function(decStr){
        if (typeof btoa === 'function') {
             return btoa(decStr);
        }
        var base64s = this.base64s;
        var bits;
        var dual;
        var i = 0;
        var encOut = "";
        while(decStr.length >= i + 3){
            bits = (decStr.charCodeAt(i++) & 0xff) <<16 | (decStr.charCodeAt(i++) & 0xff) <<8 | decStr.charCodeAt(i++) & 0xff;
            encOut += base64s.charAt((bits & 0x00fc0000) >>18) + base64s.charAt((bits & 0x0003f000) >>12) + base64s.charAt((bits & 0x00000fc0) >> 6) + base64s.charAt((bits & 0x0000003f));
        }
        if(decStr.length -i > 0 && decStr.length -i < 3){
            dual = Boolean(decStr.length -i -1);
            bits = ((decStr.charCodeAt(i++) & 0xff) <<16) |    (dual ? (decStr.charCodeAt(i) & 0xff) <<8 : 0);
            encOut += base64s.charAt((bits & 0x00fc0000) >>18) + base64s.charAt((bits & 0x0003f000) >>12) + (dual ? base64s.charAt((bits & 0x00000fc0) >>6) : '=') + '=';
        }
        return(encOut);
    },
    
    decode: function(encStr){
        if (typeof atob === 'function') {
            return atob(encStr); 
        }
        var base64s = this.base64s;
        var bits;
        var decOut = "";
        var i = 0;
        for(; i<encStr.length; i += 4){
            bits = (base64s.indexOf(encStr.charAt(i)) & 0xff) <<18 | (base64s.indexOf(encStr.charAt(i +1)) & 0xff) <<12 | (base64s.indexOf(encStr.charAt(i +2)) & 0xff) << 6 | base64s.indexOf(encStr.charAt(i +3)) & 0xff;
            decOut += String.fromCharCode((bits & 0xff0000) >>16, (bits & 0xff00) >>8, bits & 0xff);
        }
        if(encStr.charCodeAt(i -2) == 61){
            return(decOut.substring(0, decOut.length -2));
        }
        else if(encStr.charCodeAt(i -1) == 61){
            return(decOut.substring(0, decOut.length -1));
        }
        else {
            return(decOut);
        }
    }
};/* Uses static data to mock an adapter. */
jsfb.data.TestAdapter = Ext.extend(Object, {
    
    // static directory listing
    // from: https://pods.iplantcollaborative.org/wiki/display/docs/Foundational+API+v1.0
    fakeDirectory: [
       {"name":"..",
        "path":"/api_sample_user/",
        "lastModified":1294357013000,
        "length":409600,
        "owner":"api_sample_user",
        "permisssions":"all",
        "mimeType":"",
        "format":"folder",
        "type":"dir"},
       {"name":"FWA1.fa",
        "path":"/api_sample_user/FWA1.fa",
        "lastModified":1294435955000,
        "length":2644,
        "owner":"api_sample_user",
        "permisssions":"all",
        "format":"FASTA-0",
        "mimeType":"application/binary",
        "type":"file"},
       {"name":"landsberg.small.fastq",
        "path":"/api_sample_user/landsberg.small.fastq",
        "lastModified":1294429807000,
        "length":40960000,
        "owner":"api_sample_user",
        "permisssions":"all",
        "format":"FASTQ-0",
        "mimeType":"application/binary",
        "type":"file"},
       {"name":"landsberg.tiny.fastq",
        "path":"/api_sample_user/landsberg.tiny.fastq",
        "lastModified":1294436800000,
        "length":409600,
        "owner":"api_sample_user",
        "permisssions":"all",
        "format":"FASTQ-0",
        "mimeType":"application/binary",
        "type":"file"},
       {"name":"sample.fq",
        "path":"/api_sample_user/sample.fq",
        "lastModified":1294425606000,
        "length":409600,
        "owner":"api_sample_user",
        "permisssions":"all",
        "format":"FASTQ-0",
        "mimeType":"application/binary",
        "type":"file"},
       {"name":"test.fasta",
        "path":"/api_sample_user/test.fasta",
        "lastModified":1294429977000,
        "length":2422,
        "owner":"api_sample_user",
        "permisssions":"all",
        "format":"FASTA-0",
        "mimeType":"application/binary",
        "type":"file"},
       {"name":"ShinyNewDirectory",
        "path":"/api_sample_user/ShinyNewDirectory",
        "lastModified":1294422460000,
        "length":0,
        "owner":"api_sample_user",
        "permisssions":"all",
        "format":"raw",
        "mimeType":"",
        "type":"dir"}],
    
    /* Login to the data provider. */
    login: function(config) {
        if (config.success) {
            config.success(this.fakeDirectory);
        }
    },
    
    /* Logout from the data provider. */
    logout: function(config) {
        if (config.success) {
            config.success();
        }
    },
    
    /* List the contents of a directory. */
    list: function(config) {
        var data = this.fakeDirectory;
        
        if (config.success) {
            config.success(data);
        }
    },
    
    /* Create a new directory. */
    makeDir: function(config) {
        this.fakeDirectory.push({
            "name": config.name,
            "path": config.path + '/' + config.name,
            "lastModified": Math.round((new Date()).getTime() / 1000),
            "length":0,
            "owner": config.user,
            "permisssions": "all",
            "format": "folder",
            "mimeType": "",
            "type":"dir"
        });
        
        if (config.success) {
            config.success();
        }
    },
    
    /* Rename a path. */
    renamePath: function(config) {
        config.item.name = config.newName;
        
        if (config.success) {
            config.success();
        }
    },
    
    /* Delete a path. */
    deletePath: function(config) {
        var delIdx;
        for (var i = 0; i < this.fakeDirectory.length; i++) {
            var item = this.fakeDirectory[i];
            if (item.path === config.item.path) {
                delIdx = i;
                break;
            }
        }
        
        delete this.fakeDirectory[delIdx];
        
        if (config.success) {
            config.success();
        }
    }
});/* Connects to REST server exposing iRods REST interface. */
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
/* Formats data to be displayed in a FileGrid. */
jsfb.data.DataFormatter = Ext.extend(Object, {

    /* Return string that describes a file's size. */
    getFileSize: function(item) {
        var val = item.length;

        if (false) {
            return
        } else if (val > 1099511627776) {
            return (val / 1099511627776).toFixed(1) + ' TB';
        } else if (val > 1073741824) {
            return (val / 1073741824).toFixed(1) + ' GB';
        } else if (val > 104857) {
            return (val / 104857).toFixed(1) + ' MB';
        } else if (val > 0) {
            return (val / 1024).toFixed(1) + ' KB';
        } else {
            if (item.type === 'dir') {
                return '--';
            } else {
                return 'empty';
            }
        }
    },

    /* Format special fields. */
    format: function(data) {
        data.size = this.getFileSize(data);
        data.modified = new Date(data.lastModified).format('M d Y h:m a');

        // REST API data misspelling
        if (data.permisssion) {
            data.permission = data.permisssion;
        }

        // Short-cut to determine if user has write access
        var writes = ['own', 'all', 'write'];
        if (writes.indexOf(data.permissions.toLowerCase()) > -1) {
            data.writable = true;
        } else {
            data.writable = false;
        }
    },
});
