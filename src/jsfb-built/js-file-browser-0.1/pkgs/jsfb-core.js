/*
 * js-file-browser 0.1
 * Copyright(c) 2011 Bio Computing Facility, University of Arizona.
 * 
 * With components from: Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
/*
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.ns("Ext.ux.layout");Ext.ux.layout.CenterLayout=Ext.extend(Ext.layout.FitLayout,{setItemSize:function(b,a){this.container.addClass("ux-layout-center");b.addClass("ux-layout-center-item");if(b&&a.height>0){if(b.width){a.width=b.width}b.setSize(a)}}});Ext.Container.LAYOUTS["ux.center"]=Ext.ux.layout.CenterLayout;Ext.ns("jsfb","jsfb.data","jsfb.widgets");jsfb.widgets.Browser=Ext.extend(Ext.Panel,{constructor:function(a){var b={title:"JS File Browser",height:400,width:600,url:"",path:"/",layout:"fit"};Ext.apply(b,a);if(!b.fileAdapter){b.fileAdapter=new jsfb.data.TestAdapter()}Ext.apply(this,b);jsfb.widgets.Browser.superclass.constructor.apply(this,arguments);this.logout()},showMessage:function(g){var e={msg:"",cls:"",showClose:true,timeout:7000};Ext.apply(e,g);if(!this.msgContainer){var b=Ext.query(".x-panel-body",this.el.dom)[0];this.msgContainer=Ext.DomHelper.append(b,{tag:"div",cls:"message-container"})}var a="message "+e.cls;var c=Ext.DomHelper.append(this.msgContainer,{tag:"div",cls:a,children:[{tag:"span",cls:"message-text",html:e.msg}]});var f=Ext.get(c);f.close=function(){this.remove()};if(e.showClose){var d=Ext.DomHelper.append(c,{tag:"div",cls:"message-close"});Ext.get(d).on("click",function(){f.close()})}if(e.timeout){setTimeout(function(){f.close()},e.timeout)}return f},showError:function(a){this.showMessage({msg:a?a:"System Error",cls:"error"})},showLoading:function(b){var a=Ext.query(".x-panel-body",this.el.dom)[0];Ext.DomHelper.append(a,{tag:"div",cls:"busy"});this.showMessage({msg:b?b:"Waiting...",cls:"load",showClose:false,timeout:0})},hideLoading:function(){var a=Ext.query(".busy",this.el.dom);if(a.length){Ext.get(a[0]).remove()}var b=Ext.query(".load",this.el.dom);if(b.length){Ext.get(b[0]).close()}},getApiConfig:function(){return{user:this.user,password:this.password,url:this.url,path:this.path}},getApiCallConfig:function(c){var a=this;var b=this.getApiConfig();Ext.apply(b,{success:function(d){c(d);a.hideLoading()},failure:function(d){a.hideLoading();a.showError(d)}});return b},login:function(){var a=this;var b=this.getApiCallConfig(function(c){a.loggedIn=true;a.setData(c)});this.showLoading();this.fileAdapter.login(b)},logout:function(){var a=this;if(this.loggedIn){var b=this.getApiCallConfig(function(c){a.loggedIn=false;a.setData(c)});this.showLoading();this.fileAdapter.logout(b)}if(!this.loginWidget){this.removeAll();this.loginWidget=this.add({layout:"ux.center",border:false,items:[{xtype:"jsfblogin",user:this.user,password:this.password,url:this.url,path:this.path,listeners:{login:function(d,c){Ext.apply(a,c);a.login()}}}]})}else{if(this.items.indexOf(this.loginWidget)<0){this.removeAll();this.add(this.loginWidget)}}this.doLayout()},changePath:function(c){console.log("Changing path to: "+c);var a=this;this.path=c;var b=this.getApiCallConfig(function(d){a.setData(d)});this.showLoading();this.fileAdapter.list(b)},makeDir:function(c){var a=this;var b=this.getApiCallConfig(function(d){if(d){a.setData(d)}else{a.changePath(a.path)}});b.name=c;this.showLoading();this.fileAdapter.makeDir(b)},setData:function(b){var a=this;if(!this.fileGrid){this.removeAll();this.fileGrid=this.add({ref:"fileGrid",xtype:"jsfbfilegrid",border:false,listeners:{pathchange:function(d,c){a.changePath(c)},makedir:function(d,c){a.makeDir(c)}}});this.fileGrid.getSelectionModel().on("rowselect",function(e,c,d){if(a.callback){a.callback.call(a,d.data)}})}else{if(this.items.indexOf(this.fileGrid)<0){this.add(this.fileGrid)}}this.doLayout();this.fileGrid.setData(this.path,b)}});Ext.reg("jsfbbrowser",jsfb.widgets.Browser);jsfb.widgets.FileGrid=Ext.extend(Ext.grid.GridPanel,{constructor:function(b){var a=this;var c={viewConfig:{forceFit:true},frame:false,border:false,autoExpandColumn:"name",autoHeight:false,columnLines:true,stripeRows:true,showHidden:false,cls:"file-grid",tbar:{style:"padding-left: 5px",items:[]},bbar:{style:"padding-left: 5px",items:['<span class="label">Filter By:</span>&nbsp;',{id:"fileFilterInput",xtype:"textfield",value:b&&b.filter?b.filter:undefined,enableKeyEvents:true,listeners:{render:function(d,f){new Ext.ToolTip({target:d.el,title:"Filter files by name."})},keydown:function(g,h){var d=500;var f={};a.filterFunc=setTimeout(function(){if(f.filterFunc===a.filterFunc){a.filterData()}},d);f.filterFunc=a.filterFunc}}},"&nbsp;&nbsp;",{xtype:"button",icon:"jsfb/resources/images/folder-horizontal--arrow-90.png",listeners:{render:function(d,f){new Ext.ToolTip({target:d.el,title:"Go to parent directory."})},click:function(d,g){var f=a.getPathAsArray();if(f.length>1){f.splice(f.length-1,1)}a.fireEvent("pathchange",a,f.join("/"))}}},{xtype:"button",icon:"jsfb/resources/images/folder-horizontal--arrow-315.png",listeners:{render:function(d,f){new Ext.ToolTip({target:d.el,title:"Refresh content."})},click:function(d,f){a.fireEvent("pathchange",a,a.path)}}},{xtype:"button",icon:"jsfb/resources/images/folder-horizontal--plus.png",listeners:{render:function(d,f){new Ext.ToolTip({target:d.el,title:"Create new directory."})},click:function(d,g){var f=new Ext.Window({renderTo:a.el,title:"New Directory",width:300,padding:10,resizable:false,layout:"form",items:[{xtype:"form",ref:"makeDirForm",unstyled:true,padding:5,items:[{xtype:"textfield",width:150,fieldLabel:"Name",name:"name",allowBlank:false}]}],bbar:[{xtype:"button",text:"Create",icon:"jsfb/resources/images/folder-horizontal--plus.png",handler:function(){var e=f.makeDirForm.getForm();if(e.isValid()){a.fireEvent("makedir",a,e.getFieldValues().name);f.close()}}}]});f.show()}}},{xtype:"button",icon:"jsfb/resources/images/document--plus.png",listeners:{render:function(d,f){new Ext.ToolTip({target:d.el,title:"Upload file."})}}}]}};Ext.apply(c,b);if(!c.store){c.store=new Ext.data.JsonStore({storeId:"dirListing",autoDestroy:true,root:"files",idProperty:"path",fields:["name","path",{name:"lastModified",type:"date",dateFormat:"time"},"length","owner","permissions","mimetype","type"]})}if(!c.colModel){c.colModel=new Ext.grid.ColumnModel({defaults:{sortable:true},columns:[{id:"name",header:"Filename",dataIndex:"name",renderer:function(h,d,g){var f=a.getIcon(g.data);var e="background-image: url(jsfb/resources/images/"+f+");";return'<div class="filename" style="'+e+'">'+h+"</div>"}},{header:"Status",dataIndex:"permissions",width:28,renderer:function(f,d,e){return a.getFileStatus(e.data)}},{header:"Size",dataIndex:"length",width:35,renderer:function(f,d,e){return a.getFileSize(e.data)}},{header:"Modified",dataIndex:"lastModified",xtype:"datecolumn",format:"M d Y h:m a",width:75},]})}Ext.apply(this,c);jsfb.widgets.FileGrid.superclass.constructor.apply(this,arguments);this.on("rowdblclick",function(f,g,h){var d=a.getStore().getAt(g);if(d.data.type==="dir"){a.fireEvent("pathchange",a,d.data.path)}else{a.setData(d.data.path,d.data)}});this.addEvents("pathchange","makedir","upload")},getPathAsArray:function(){var a=this.path.split("/");if(a[0]==""){a[0]="/"}else{a.splice(0,0,"/")}return a},setData:function(b,a){this.path=b;this.data=a;this.updateLocation();if(Ext.isArray(a)){this.filterData()}else{this.fileDetails()}},updateLocation:function(d){var b=this;var a=this.getTopToolbar();a.removeAll();var c=this.getPathAsArray();Ext.each(c,function(f,e){if(f===""){return}var g="/"+c.slice(1,e+1).join("/");a.add({xtype:"button",text:f,minWidth:20,listeners:{render:function(h,i){new Ext.ToolTip({target:h.el,title:"Go to: "+g})},click:function(h,i){b.fireEvent("pathchange",b,g)}}});a.add("&nbsp;")})},filterData:function(){var c=Ext.get("fileFilterInput").getValue();var b;if(c){c=c.replace(".","\\.");b=new RegExp(c,"i")}var a=[];Ext.each(this.data,function(d){if((!this.showHidden)&&d.name.indexOf(".")===0){return}if(b&&(!b.test(d.name))){return}a.push(d)});this.store.loadData({files:a})},getIcon:function(b){var a;if(b.type==="dir"){a=this.getDirIcon(b)}else{if(b.type==="file"){a=this.getFileIcon(b)}else{a="document.png"}}return a},getDirIcon:function(a){return"folder-horizontal.png"},getFileIcon:function(c){var a={fasta:"document-dna.png",fa:"document-dna.png",fastq:"document-dna.png",fq:"document-dna.png",txt:"document-text.png",rtf:"document-text.png",csv:"document-table.png",xls:"document-excel-table.png",doc:"document-word-text.png",ppt:"document-powerpoint.png",pdf:"document-pdf.png",html:"document-xaml.png",xml:"document-code.png",png:"image.png",gif:"image.png",tiff:"image.png",jpg:"image.png",jpeg:"image.png"};var d=c.name.split(".");if(d.length){var b=d[d.length-1];if(a.hasOwnProperty(b)){return a[b]}}return"document.png"},getFileSize:function(a){var b=a.length;if(false){return}else{if(b>1099511627776){return(b/1099511627776).toFixed(1)+" TB"}else{if(b>1073741824){return(b/1073741824).toFixed(1)+" GB"}else{if(b>104857){return(b/104857).toFixed(1)+" MB"}else{if(b>0){return(b/1024).toFixed(1)+" KB"}else{if(a.type==="dir"){return"--"}else{return"empty"}}}}}}},getFileStatus:function(b){var a='<div class="file-status">';a+='<div style="background-image: url(jsfb/resources/images/lock-unlock.png);"></div>';a+='<div style="background-image: url(jsfb/resources/images/users.png);"></div>';a+='<a><div style="background-image: url(jsfb/resources/images/information-frame.png);"></div></a>';a+="</div>";return a},fileDetails:function(){var d={size:this.getFileSize(this.data),modified:new Date(this.data.lastModified).format("M d Y h:m a"),download:"fake"};Ext.apply(d,this.data);var c='<table class="dl"><tbody><tr><th>File:</th><td>{name}</td></tr><tr><th>Path:</th><td>{path}</td></tr><tr><th>Owner:</th><td>{owner}</td></tr><tr><th>Modified:</th><td>{modified}</td></tr><tr><th>Permissions:</th><td>{permissions}</td></tr><tr><th>Size:</th><td>{size}</td></tr><tr><th>File Type:</th><td>{mimeType}</td></tr><tr><th>Download:</th><td><a href="{download}">{download}</a></td></tr></tbody></table>';var b=new Ext.Template(c);var a=Ext.query(".x-panel-body",this.el.dom)[0];a.innerHTML=b.apply(d)}});Ext.reg("jsfbfilegrid",jsfb.widgets.FileGrid);jsfb.widgets.Login=Ext.extend(Ext.FormPanel,{constructor:function(b){var a=this;var c={title:"Login",width:400,autoHeight:true,padding:10,cls:"login",items:[{xtype:"textfield",width:250,fieldLabel:"User",name:"user",allowBlank:false,value:b&&b.user?b.user:undefined},{xtype:"textfield",width:250,inputType:"password",fieldLabel:"Password",name:"password",allowBlank:false,value:b&&b.password?b.password:undefined},{xtype:"textfield",width:250,fieldLabel:"Server",name:"url",allowBlank:false,value:b&&b.url?b.url:undefined},{xtype:"textfield",width:250,fieldLabel:"Go To Path",name:"path",allowBlank:false,value:b&&b.path?b.path:undefined},],bbar:[{xtype:"button",text:"Login",icon:"jsfb/resources/images/door--arrow.png",handler:function(){a.login()}}]};Ext.apply(c,b);Ext.apply(this,c);jsfb.widgets.Login.superclass.constructor.apply(this,arguments);this.addEvents("login")},login:function(){var a=this.getForm();if(a.isValid()){this.fireEvent("login",this,a.getFieldValues())}}});Ext.reg("jsfblogin",jsfb.widgets.Login);Ext.util.base64={base64s:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",encode:function(c){if(typeof btoa==="function"){return btoa(c)}var f=this.base64s;var b;var e;var a=0;var d="";while(c.length>=a+3){b=(c.charCodeAt(a++)&255)<<16|(c.charCodeAt(a++)&255)<<8|c.charCodeAt(a++)&255;d+=f.charAt((b&16515072)>>18)+f.charAt((b&258048)>>12)+f.charAt((b&4032)>>6)+f.charAt((b&63))}if(c.length-a>0&&c.length-a<3){e=Boolean(c.length-a-1);b=((c.charCodeAt(a++)&255)<<16)|(e?(c.charCodeAt(a)&255)<<8:0);d+=f.charAt((b&16515072)>>18)+f.charAt((b&258048)>>12)+(e?f.charAt((b&4032)>>6):"=")+"="}return(d)},decode:function(c){if(typeof atob==="function"){return atob(c)}var e=this.base64s;var d;var a="";var b=0;for(;b<c.length;b+=4){d=(e.indexOf(c.charAt(b))&255)<<18|(e.indexOf(c.charAt(b+1))&255)<<12|(e.indexOf(c.charAt(b+2))&255)<<6|e.indexOf(c.charAt(b+3))&255;a+=String.fromCharCode((d&16711680)>>16,(d&65280)>>8,d&255)}if(c.charCodeAt(b-2)==61){return(a.substring(0,a.length-2))}else{if(c.charCodeAt(b-1)==61){return(a.substring(0,a.length-1))}else{return(a)}}}};jsfb.data.TestAdapter=Ext.extend(Object,{fakeDirectory:[{name:"..",path:"/api_sample_user/",lastModified:1294357013000,length:409600,owner:"api_sample_user",permisssions:"all",mimeType:"",format:"folder",type:"dir"},{name:"FWA1.fa",path:"/api_sample_user/FWA1.fa",lastModified:1294435955000,length:2644,owner:"api_sample_user",permisssions:"all",format:"FASTA-0",mimeType:"application/binary",type:"file"},{name:"landsberg.small.fastq",path:"/api_sample_user/landsberg.small.fastq",lastModified:1294429807000,length:40960000,owner:"api_sample_user",permisssions:"all",format:"FASTQ-0",mimeType:"application/binary",type:"file"},{name:"landsberg.tiny.fastq",path:"/api_sample_user/landsberg.tiny.fastq",lastModified:1294436800000,length:409600,owner:"api_sample_user",permisssions:"all",format:"FASTQ-0",mimeType:"application/binary",type:"file"},{name:"sample.fq",path:"/api_sample_user/sample.fq",lastModified:1294425606000,length:409600,owner:"api_sample_user",permisssions:"all",format:"FASTQ-0",mimeType:"application/binary",type:"file"},{name:"test.fasta",path:"/api_sample_user/test.fasta",lastModified:1294429977000,length:2422,owner:"api_sample_user",permisssions:"all",format:"FASTA-0",mimeType:"application/binary",type:"file"},{name:"ShinyNewDirectory",path:"/api_sample_user/ShinyNewDirectory",lastModified:1294422460000,length:0,owner:"api_sample_user",permisssions:"all",format:"raw",mimeType:"",type:"dir"}],login:function(a){if(a.success){a.success(this.fakeDirectory)}},logout:function(a){if(a.success){a.success()}},list:function(a){var d=this.fakeDirectory;for(var b=0;b<this.fakeDirectory.length;b++){var c=this.fakeDirectory[b];if(c.type==="dir"&&c.path===a.path){d=[];break}}if(a.success){a.success(d)}},makeDir:function(a){this.fakeDirectory.push({name:a.name,path:a.path+"/"+a.name,lastModified:Math.round((new Date()).getTime()/1000),length:0,owner:a.user,permisssions:"all",format:"folder",mimeType:"",type:"dir"});if(a.success){a.success(this.fakeDirectory)}}});jsfb.data.RestAdapter=Ext.extend(Object,{pathAsUrl:function(b){var a=b.split("/");var c=[];Ext.each(a,function(d){if(d){c.push(encodeURIComponent(d))}});return c.join("/")},login:function(a){var b="Basic "+Ext.util.base64.encode(a.user+":"+a.password);Ext.Ajax.request({url:a.url+"/io-v1/io/list/"+this.pathAsUrl(a.path)+"/",headers:{Authorization:b},success:function(c,d){a.success(c.result)},failure:function(c,d){a.failure(c.message)}})}});