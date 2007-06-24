// see license.txt for licensing
function Browser(){
	var ua=navigator.userAgent;
	this.isFirefox=ua.indexOf('Firefox')>=0;
	this.isOpera=ua.indexOf('Opera')>=0;
	this.isIE=ua.indexOf('MSIE')>=0&&!this.isOpera;
	this.isSafari=ua.indexOf('Safari')>=0;
	this.isKonqueror=ua.indexOf('KHTML')>=0&&!this.isSafari;
	this.versionMinor=parseFloat(navigator.appVersion);
	if(this.isIE)this.versionMinor=parseFloat(ua.substring(ua.indexOf('MSIE')+5));
	this.versionMajor=parseInt(this.versionMinor);
}
function kfm(){
	var form_panel,form,right_column,message,directories,logs,logHeight=64,w=getWindowSize(),j,i;
	{ // extend language objects
		for(var j in kfm_lang){
			if(kfm_regexps.percent_numbers.test(kfm_lang[j])){
				kfm_lang[j]=(function(str){
					return function(){
						var tmp=str;
						for(i=1;i<arguments.length+1;++i)tmp=tmp.replace("%"+i,arguments[i-1]);
						return tmp;
					};
				})(kfm_lang[j]);
			}
		}
	}
	kfm_cwd_name=starttype;
	{ // create left column
		var left_column=kfm_createPanelWrapper('kfm_left_column');
		kfm_addPanel(left_column,'kfm_directories_panel');
		kfm_addPanel(left_column,'kfm_search_panel');
		kfm_addPanel(left_column,'kfm_directory_properties_panel');
		if(!kfm_inArray('kfm_logs_panel',kfm_hidden_panels))kfm_addPanel(left_column,'kfm_logs_panel');
		left_column.panels_unlocked=1;
		left_column.setStyles('height:'+w.y+'px');
		addEvent(left_column,'contextmenu',function(e){
			var m=getMouseAt(e);
			e=new Event(e);
			{ // variables
				var row,cell,cells,rows=0,target=kfm_getParentEl(e.target,'DIV');
			}
			{ // add the links
				var links=[],i;
				var l=left_column.panels_unlocked;
				links.push(['kfm_togglePanelsUnlocked()',l?kfm_lang.LockPanels:kfm_lang.UnlockPanels,l?'lock':'unlock']);
				var ps=left_column.panels;
				for(var i=0;i<ps.length;++i){
					var p=$(ps[i]);
					if(!p.visible)links.push(['kfm_addPanel("kfm_left_column","'+ps[i]+'")',kfm_lang.ShowPanel(p.panel_title),'show_panel']);
				}
				kfm_createContextMenu(m,links);
			}
		});
	}
	{ // create right_column
		right_column=newEl('div','kfm_right_column');
		addEvent(right_column,'click',function(){if(!window.dragType)kfm_selectNone()});
		addEvent(right_column,'mousedown',function(e){
			if(e.button==2)return;
			window.mouseAt=getMouseAt(e);
			if(this.contentMode=='file_icons' && this.fileids.length)window.dragSelectionTrigger=setTimeout(function(){kfm_selection_dragStart()},200);
			addEvent(right_column,'mouseup',kfm_selection_dragFinish);
		});
		addEvent(right_column,'contextmenu',function(e){
			var links=[],i;
			links.push(['kfm_createEmptyFile()',kfm_lang.CreateEmptyFile,'filenew',!kfm_vars.permissions.file.mk]);
			if(selectedFiles.length>1)links.push(['kfm_renameFiles()',kfm_lang.RenameFile,'edit',!kfm_vars.permissions.file.ed]);
			if(selectedFiles.length>1)links.push(['kfm_zip()','zip up files','',!kfm_vars.permissions.file.mk]); // TODO: new string
			if(selectedFiles.length!=$('kfm_right_column').fileids.length)links.push(['kfm_selectAll()',kfm_lang.SelectAll,'ark_selectall']);
			if(selectedFiles.length){ // select none, invert selection
				links.push(['kfm_selectNone()',kfm_lang.SelectNone,'select_none']);
				links.push(['kfm_selectInvert()',kfm_lang.InvertSelection,'invert_selection']);
			}
			kfm_createContextMenu(getMouseAt(getEvent(e,1)),links);
		});
	}
	{ // create message div
		message=newEl('div','message');
	}
	{ // draw areas to screen and load files and directory info
		kfm_addEl(document.body.empty(),[left_column,right_column,message]);
		x_kfm_loadFiles(1,kfm_refreshFiles);
		x_kfm_loadDirectories(1,kfm_refreshDirectories);
	}
	addEvent(document,'keyup',kfm_keyup);
	addEvent(window,'resize',kfm_handleWindowResizes);
	kfm_contextmenuinit();
}
function kfm_addCell(o,b,c,d,e){
	var f=o.insertCell(b);
	if(c)f.colSpan=c;
	if(d)kfm_addEl(f,d);
	if(e)f.className=e;
	return f;
}
function kfm_addEl(o,a){
	if(!a)return o;
	if($type(a)!='array')a=[a];
	for(var i=0;i<a.length;++i){
		if($type(a[i])=='array')kfm_addEl(o,a[i]);
		else o.appendChild(a[i].toString()===a[i]?newText(a[i]):a[i]);
	}
	return o;
}
function kfm_addRow(t,p,c){
	var o=t.insertRow(p===parseInt(p)?p:t.rows.length);
	o.className=c;
	return o;
}
function kfm_alert(txt){
	window.inPrompt=1;
	alert(txt);
	setTimeout('window.inPrompt=0',1);
}
function kfm_cancelEvent(e,c){
	e.stopPropagation();
	if(c)e.preventDefault();
}
function kfm_confirm(txt){
	window.inPrompt=1;
	var ret=confirm(txt);
	setTimeout('window.inPrompt=0',1);
	return ret;
}
function kfm_getContainer(p,c){
	for(i=0;i<c.length;++i){
		var a=c[i],x=getOffset(a,'Left'),y=getOffset(a,'Top');
		if(x<p.x&&y<p.y&&x+a.offsetWidth>p.x&&y+a.offsetHeight>p.y)return a;
	}
}
function kfm_getParentEl(c,t){
	while(c.tagName!=t&&c)c=c.parentNode;
	return c;
}
function kfm_handleWindowResizes(){
	var w=getWindowSize();
	var to_max_height=['kfm_left_column','kfm_left_column_hider','kfm_lightboxShader'];
	var to_max_width=['kfm_lightboxShader'];
	for(var i=0;i<to_max_height.length;++i)if($(to_max_height[i]))$(to_max_height[i]).setStyles('height:'+w.y+'px');
	for(var i=0;i<to_max_width.length;++i)if($(to_max_width[i]))$(to_max_width[i]).setStyles('width:'+w.x+'px');
	if($('kfm_codepressTableCell')){
		var el=$('kfm_codepressTableCell'),iframe=$E('iframe',el);
		iframe.style.height=0;
		iframe.style.width=0;
		iframe.style.height=(el.offsetHeight-10)+'px';
		iframe.style.width=(el.offsetWidth-10)+'px';
	}
	kfm_refreshPanels('kfm_left_column');
}
function kfm_hideMessage(){
	$('message').setStyles('display:none');
}
function kfm_inArray(needle,haystack){
	for(var i=0;i<haystack.length;++i)if(haystack[i]==needle)return true;
	return false;
}
function kfm_keyup(e){
	var key=browser.isIE?e.keyCode:e.which;
	switch(key){
		case 13:{ // enter
			if(!selectedFiles.length||window.inPrompt||$('kfm_right_column').contentMode!='file_icons')return;
			if(selectedFiles.length>1)return kfm_log(kfm_lang.NotMoreThanOneFile);
			kfm_chooseFile($('kfm_file_icon_'+selectedFiles[0]),1);
			break;
		}
		case 27:{ // escape
			if(!window.inPrompt&&kfm_confirm(kfm_lang.AreYouSureYouWantToCloseKFM))window.close();
			break;
		}
		case 37:{ // left arrow
			if($('kfm_right_column').contentMode=='file_icons')kfm_shiftFileSelectionLR(-1);
			break;
		}
		case 38:{ // up arrow
			if($('kfm_right_column').contentMode=='file_icons')kfm_shiftFileSelectionUD(-1);
			break;
		}
		case 39:{ // right arrow
			if($('kfm_right_column').contentMode=='file_icons')kfm_shiftFileSelectionLR(1);
			break;
		}
		case 40:{ // down arrow
			if($('kfm_right_column').contentMode=='file_icons')kfm_shiftFileSelectionUD(1);
			break;
		}
		case 46:{ // delete
			if(!selectedFiles.length||$('kfm_right_column').contentMode!='file_icons')return;
			if(selectedFiles.length>1)kfm_deleteSelectedFiles();
			else kfm_deleteFile(selectedFiles[0]);
			break;
		}
		case 65:{ // a
			if(e.ctrlKey&&$('kfm_right_column').contentMode=='file_icons'){
				clearSelections(e);
				kfm_selectAll();
			}
			break;
		}
		case 85:{ // u
			if(e.ctrlKey&&$('kfm_right_column').contentMode=='file_icons'){
				clearSelections(e);
				kfm_selectNone();
			}
			break;
		}
		case 113:{ // f2
			if($('kfm_right_column').contentMode!='file_icons')return;
			if(!selectedFiles.length)return kfm_alert(kfm_lang.PleaseSelectFileBeforeRename);
			if(selectedFiles.length==1){
				kfm_renameFile(selectedFiles[0]);
			}
			else kfm_alert(kfm_lang.RenameOnlyOneFile);
		}
	}
}
function kfm_log(msg){
	var wrapper=$('kfm_logs_panel');
	if(!wrapper){
		if(msg.indexOf(kfm_lang.ErrorPrefix)!=0)return;
		if(kfm_inArray('kfm_logs_panel',kfm_hidden_panels))return kfm_alert(msg.replace(kfm_lang.ErrorPrefix,''));
		kfm_addPanel('kfm_left_column','kfm_logs_panel');
		kfm_refreshPanels('kfm_left_column');
		wrapper=$('kfm_logs_panel');
	}
	wrapper.visible=1;
	var el=$E('#kfm_logs_panel div.kfm_panel_body'),p=newEl('p',0,0,msg);
	if(msg.indexOf(kfm_lang.ErrorPrefix)==0)p.setStyles('background:#ff0;fontWeight:bold;color:red');
	kfm_addEl(el,p);
	el.scrollTop=el.scrollTop+p.offsetHeight;
}
function kfm_prompt(txt,val){
	window.inPrompt=1;
	var newVal=prompt(txt,val?val:'');
	setTimeout('window.inPrompt=0',1);
	return newVal;
}
function kfm_run_delayed(name,call){
	name=name+'_timeout';
	if(window[name])$clear(window[name]);
	window[name]=setTimeout(call,500);
}
function kfm_shrinkName(name,wrapper,text,size,maxsize,extension){
	var position=step=Math.ceil(name.length/2),postfix='[...]'+extension,prefix=size=='offsetHeight'?'. ':'';
	do{
		text.innerHTML=prefix+name.substring(0,position)+postfix;
		step=Math.ceil(step/2);
		position+=(wrapper[size]>maxsize)?-step:step;
	}while(step>1);
	var html='<span class="filename">'+name.substring(0,position+(prefix?0:-1))+'</span><span style="color:red;text-decoration:none">[...]</span>';
	if(extension)html+='<span class="filename">'+extension+'</span>';
	text.innerHTML=html;
}
var kfm_regexps={
	all_up_to_last_dot:/.*\./,
	all_up_to_last_slash:/.*\//,
	ascii_stuff:/%([89A-F][A-Z0-9])/g,
	get_filename_extension:/.*\.([^.]*)$/,
	percent_numbers:/%[1-9]/,
	plus:/\+/g,
	remove_filename_extension:/\.[^.]*$/
}
