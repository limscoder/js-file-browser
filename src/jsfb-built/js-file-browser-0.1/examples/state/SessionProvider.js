/*!
 * js-file-browser 0.1
 * Copyright(c) 2011 Bio Computing Facility, University of Arizona.
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
Ext.state.SessionProvider = Ext.extend(Ext.state.CookieProvider, {
    readCookies : function(){
        if(this.state){
            for(var k in this.state){
                if(typeof this.state[k] == 'string'){
                    this.state[k] = this.decodeValue(this.state[k]);
                }
            }
        }
        return Ext.apply(this.state || {}, Ext.state.SessionProvider.superclass.readCookies.call(this));
    }
});