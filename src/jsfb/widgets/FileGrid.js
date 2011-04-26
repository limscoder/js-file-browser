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
                        icon: jsfb.resource_prefix + 'images/folder-horizontal--arrow-90.png',
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
                        icon: jsfb.resource_prefix + 'images/folder-horizontal--arrow-315.png',
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
                        icon: jsfb.resource_prefix + 'images/folder-horizontal--plus.png',
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
                                           icon: jsfb.resource_prefix + 'images/folder-horizontal--plus.png',
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
                                           icon: jsfb.resource_prefix + 'images/close.png',
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
                        icon: jsfb.resource_prefix + 'images/document--plus.png',
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
                                           icon: jsfb.resource_prefix + 'images/document--plus.png',
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
                                           icon: jsfb.resource_prefix + 'images/close.png',
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
                            var style = 'background-image: url(' + jsfb.resource_prefix + 'images/' + icon + ');'
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
            html += '<div style="background-image: url(' + jsfb.resource_prefix + 'images/lock-unlock.png);"></div>';
        } else {
            html += '<div style="background-image: url(' + jsfb.resource_prefix + 'images/lock.png);"></div>';
        }
        
        // Sharing icon
        //html += '<div style="background-image: url(../resources/images/users.png);"></div>';
        
        // Info icon
        var infoClick = "var fb = Ext.getCmp('" + this.id + "'); fb.pathDetails('" +
            item.path + "'); return false;";
        html += '<a onclick="' + infoClick + '"><div style="background-image: url(' + jsfb.resource_prefix + 'images/information-frame.png);"></div></a>';
        
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
