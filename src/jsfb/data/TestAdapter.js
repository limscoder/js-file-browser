/* Uses static data to mock an adapter. */
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
});