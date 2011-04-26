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
                   icon: jsfb.resource_prefix + 'images/door--arrow.png',
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
