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
{ // variables
	var kfm_directory_over=0;
	if(!window.kfm_callerType)window.kfm_callerType='standalone';
	var browser=new Browser(),loadedScripts=[],kaejax_is_loaded=0,function_urls=[];
	var kfm_cwd_name='',kfm_cwd_id=0,kfm_cwd_subdirs=[],contextmenu=null,selectedFiles=[],kfm_imageExts=['jpg','jpeg','gif','png','bmp'];
	var kfm_filesCache=[],kfm_tags=[],kfm_tracers=[],kfm_tracer_v=10,kfm_lastClicked,kfm_unique_classes=[];
	var kaejax_timeouts=[],kfm_directories=[0,{name:'root',pathname:'/'}];
	var kaejax_replaces={'([89A-F][A-Z0-9])':'%u00$1','22':'"','2C':',','3A':':','5B':'[','5D':']','7B':'{','7D':'}'};
	if(!browser.isIE){
		for(var a in kaejax_replaces){
			kaejax_replaces[kaejax_replaces[a]]=eval('/%'+a+'/g');
			delete kaejax_replaces[a];
		}
	}
}
function kfm(){
	{ // extend language objects
		for(var j in kfm_lang){
			if(/%[1-9]/.test(kfm_lang[j])){
				kfm_lang[j]=(function(str){
					return function(){
						var tmp=str;
						for(var i=1;i<arguments.length+1;++i)tmp=tmp.replace("%"+i,arguments[i-1]);
						return tmp;
					};
				})(kfm_lang[j]);
			}
		}
	}
	{ // add custom functions to all existing elements
		var els=document.getElementsByTagName('*');
		for(var i in els){if(els[i].tagName)kfm_addMethods(els[i])};
	}
	var form_panel,form,iframe,right_column,message, directories,logs,logHeight=64,w=getWindowSize();
	kfm_cwd_name=starttype;
	{ // create left column
		var left_column=kfm_createPanelWrapper('kfm_left_column');
		kfm_addPanel(left_column,'kfm_directories_panel');
		kfm_addPanel(left_column,'kfm_search_panel');
		kfm_addPanel(left_column,'kfm_directory_properties_panel');
		kfm_addPanel(left_column,'kfm_logs_panel');
		left_column.panels_unlocked=1;
		left_column.setCss('height:'+w.y+'px');
		left_column.contextmenu=function(e){
			e=getEvent(e);
			{ // variables
				var row,cell,cells,m=getMouseAt(e),rows=0,target=kfm_getParentEl(getEventTarget(e),'DIV');
//				while(target.tagName!='DIV'&&target)target=target.parentNode;
			}
			{ // add the links
				var links=[],i;
				var l=left_column.panels_unlocked;
				links.push(['javascript:kfm_togglePanelsUnlocked()',l?kfm_lang.LockPanels:kfm_lang.UnlockPanels,l?'lock':'unlock']);
				var ps=left_column.panels;
				for(var i in ps){
					var p=$(ps[i]);
					if(!p.visible)links.push(['javascript:kfm_addPanel("kfm_left_column","'+ps[i]+'")',kfm_lang.ShowPanel(p.panel_title),'show_panel']);
				}
				kfm_createContextMenu(m,links);
			}
		};
	}
	{ // create right_column
		right_column=newEl('div','kfm_right_column');
		addEvent(right_column,'click',function(){if(!window.dragType)kfm_selectNone()});
		addEvent(right_column,'mousedown',function(e){
			if(e.button==2)return;
			window.mouseAt=getMouseAt(e);
			window.dragSelectionTrigger=setTimeout(function(){kfm_selection_dragStart()},200);
			addEvent(right_column,'mouseup',kfm_selection_dragFinish);
		});
		right_column.contextmenu=function(e){
			var links=[],i;
			links.push(['javascript:kfm_createEmptyFile()',kfm_lang.CreateEmptyFile,'filenew']);
//			if(selectedFiles.length>1)links.push(['javascript:kfm_renameFiles()',kfm_lang.RenameFile,'edit']);
			if(selectedFiles.length!=$('kfm_right_column').fileids.length)links.push(['javascript:kfm_selectAll()',kfm_lang.SelectAll,'ark_selectall']);
			if(selectedFiles.length)links.push(['javascript:kfm_selectNone()',kfm_lang.SelectNone,'select_none']);
			links.push(['javascript:kfm_selectInvert()',kfm_lang.InvertSelection,'invert_selection']);
			kfm_createContextMenu(getMouseAt(getEvent(e,1)),links);
		};
	}
	{ // create message div
		message=newEl('div','message');
	}
	{ // draw areas to screen and load files and directory info
		document.body.addClass(browser.isIE?'ie':(browser.isFirefox?'firefox':''));
		document.body.empty().addEl([left_column,right_column, message]);
		x_kfm_loadFiles(1,kfm_refreshFiles);
		x_kfm_loadDirectories(1,kfm_refreshDirectories);
	}
	addEvent(document,'keyup',kfm_keyup);
	addEvent(window,'resize',function(){$('kfm_left_column').setCss('height:'+getWindowSize().y+'px');kfm_refreshPanels('kfm_left_column')});
	kfm_contextmenuinit();
}
function kfm_addMethods(el){
	X(el,{
		addCell:function(b,c,d,e){
			var f=kfm_addMethods(this.insertCell(b));
			if(c)f.colSpan=c;
			if(d)f.addEl(d);
			f.setClass(e);
			return f;
		},
		addClass:function(c){
			this.setClass(this.getClass()+' '+c);
		},
		addEl:function(a){
			if(!a)return;
			if(!isArray(a))a=[a];
			for(var i in a){
				if(isArray(a[i]))this.addEl(a[i]);
				else this.appendChild(a[i].toString()===a[i]?newText(a[i]):a[i]);
			}
		},
		addRow:function(p,c){
			var o=this.insertRow(p===parseInt(p)?p:this.rows.length);
			kfm_addMethods(o);
			o.setClass(c);
			return o;
		},
		contextmenu:function(e){},
		delClass:function(n){
			var i,d=[],c=this.getClass().split(" ");
			if(isArray(n)){
				for(i in n)this.delClass(n[i]);
				return;
			}
			for(i in c)if(c[i]!=n)d.push(c[i]);
			this.setClass(d.join(" "));
		},
		empty:function(){
			while(this.childNodes&&this.childNodes.length)delEl(this.childNodes[0]);
			return this;
		},
		getClass:function(){return this.className?this.className:''},
		hasClass:function(c){return new RegExp('(\\s|^)'+c+'(\\s|$)').test(this.className)},
		setClass:function(c,u){
			this.className=c?c:'';
			if(!u)return;
			if(kfm_unique_classes[c])kfm_unique_classes[c].delClass(c);
			kfm_unique_classes[c]=this;
		},
		setCss:function(s){
			var i;
			s=s.split(';');
			for(i in s){
				var p=s[i].split(':');
				var r=p[0],v=p[1];
				if(r=='opacity')setOpacity(this,v);
				else if(r=='float')setFloat(this,v);
				else try{this.style[r]=v}catch(e){kfm_log(kfm_lang.SetStylesError(r,v))}
			}
			return this;
		}
	});
	addEvent(el,'contextmenu',function(e){this.contextmenu(e)});
	return el;
}
function kfm_cancelEvent(e,c){
	e.stopPropagation();
	if(c)e.preventDefault();
}
function kfm_getContainer(p,c){
	for(var i in c){
		var a=c[i],x=getOffset(a,'Left'),y=getOffset(a,'Top');
		if(x<p.x&&y<p.y&&x+a.offsetWidth>p.x&&y+a.offsetHeight>p.y)return a;
	}
}
function kfm_getParentEl(c,t){
	while(c.tagName!=t&&c)c=c.parentNode;
	return c;
}
function kfm_getWindow(){
	return window;
}
function kfm_hideMessage(){
	$('message').setCss('display:none');
}
function kfm_inArray(haystack,needle){
	var i;
	for(i in haystack)if(haystack[i]==needle)return true;
	return false;
}
function kfm_isPointInBox(x1,y1,x2,y2,x3,y3){
	return(x1>=x2&&x1<=x3&&y1>=y2&&y1<=y3);
}
function kfm_keyup(e){
	var key=browser.isIE?e.keyCode:e.which;
	switch(key){
		case 13:{ // enter
			if(!selectedFiles.length||window.inPrompt)return;
			if(selectedFiles.length>1)return kfm_log(kfm_lang.NotMoreThanOneFile);
			kfm_chooseFile($('kfm_file_icon_'+selectedFiles[0]),1);
			break;
		}
		case 27:{ // escape
			if(!window.inPrompt&&confirm(kfm_lang.AreYouSureYouWantToCloseKFM))window.close();
			break;
		}
		case 37:{ // left arrow
			kfm_shiftFileSelectionLR(-1);
			break;
		}
		case 38:{ // up arrow
			kfm_shiftFileSelectionUD(-1);
			break;
		}
		case 39:{ // right arrow
			kfm_shiftFileSelectionLR(1);
			break;
		}
		case 40:{ // down right arrow
			kfm_shiftFileSelectionUD(1);
			break;
		}
		case 46:{ // delete
			if(!selectedFiles.length)return;
			if(selectedFiles.length>1)kfm_deleteSelectedFiles();
			else kfm_deleteFile(selectedFiles[0]);
			break;
		}
		case 65:{ // a
			if(e.ctrlKey){
				clearSelections(e);
				kfm_selectAll();
			}
			break;
		}
		case 85:{ // u
			if(e.ctrlKey){
				clearSelections(e);
				kfm_selectNone();
			}
			break;
		}
		case 113:{ // f2
			if(!selectedFiles.length)return alert(kfm_lang.PleaseSelectFileBeforeRename);
			if(selectedFiles.length==1){
				kfm_renameFile(selectedFiles[0]);
			}
			else alert(kfm_lang.RenameOnlyOneFile);
		}
	}
}
function kfm_log(msg){
	var wrapper=$('kfm_logs_panel');
	if(!wrapper){
		if(msg.indexOf(kfm_lang.ErrorPrefix)!=0)return;
		kfm_addPanel('kfm_left_column','kfm_logs_panel');
		kfm_refreshPanels('kfm_left_column');
		wrapper=$('kfm_logs_panel');
	}
	wrapper.visible=1;
	var el=getElsWithClass('kfm_panel_body','DIV',$('kfm_logs_panel'))[0],p=newEl('p',0,0,msg);
	if(msg.indexOf(kfm_lang.ErrorPrefix)==0)p.setCss('background:#ff0;fontWeight:bold;color:red');
	el.addEl(p);
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
	if(window[name])clearTimeout(window[name]);
	window[name]=setTimeout(call,500);
}
function kfm_sanitise_ajax(d){
	var r=kaejax_replaces;
	for(var a in r)d=d.replace(r[a],a);
	return d;
}
function kfm_shrinkName(name,wrapper,text,size,maxsize,extension){
	var filename,position=step=Math.ceil(name.length/2),direction,postfix='[...]'+extension;
	do{
		filename=name.substring(0,position);
		text.innerHTML=filename+postfix;
		direction=(wrapper[size]>maxsize)?-1:1;
		step=Math.ceil(step/2);
		position=position+step*direction;
	}while(step>1);
	filename=name.substring(0,position-1);
	var html='<span class="filename">'+filename+'</span><span style="color:red;text-decoration:none">[...]</span>';
	if(extension)html+='<span class="filename">'+extension+'</span>';
	text.innerHTML=html;
}
