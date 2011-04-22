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


