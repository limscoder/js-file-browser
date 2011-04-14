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
/**
 * @class Ext.data.Response
 * A generic response class to normalize response-handling internally to the framework.
 */
Ext.data.Response = function(params) {
    Ext.apply(this, params);
};
Ext.data.Response.prototype = {
    /**
     * @cfg {String} action {@link Ext.data.Api#actions}
     */
    action: undefined,
    /**
     * @cfg {Boolean} success
     */
    success : undefined,
    /**
     * @cfg {String} message
     */
    message : undefined,
    /**
     * @cfg {Array/Object} data
     */
    data: undefined,
    /**
     * @cfg {Object} raw The raw response returned from server-code
     */
    raw: undefined,
    /**
     * @cfg {Ext.data.Record/Ext.data.Record[]} records related to the Request action
     */
    records: undefined
};
