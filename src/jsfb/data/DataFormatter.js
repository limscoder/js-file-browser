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
