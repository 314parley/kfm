// see license.txt for licensing
function kfm_addPanel(wrapper,panel){
	var t;
	if(!wrapper)return false;
	if(kfm_hasPanel(wrapper,panel)){
		document.getElementById(panel).visible=1;
		kfm_refreshPanels(wrapper);
		return;
	}
	if(panel=='kfm_directories_panel'){
		t=document.createElement('table');
		t.id='kfm_directories';
		el=kfm_createPanel(
			kfm.lang.Directories,
			'kfm_directories_panel',
			t,
			{'state':1,'abilities':-1,'order':1}
		);
	}
	else if(panel=='kfm_directory_properties_panel'){
		t=document.createElement('div');
		t.className='kfm_directory_properties';
		el=kfm_createPanel(
			kfm.lang.DirectoryProperties,
			'kfm_directory_properties_panel',
			t,
			{state:0,abilities:1}
		);
	}
	else if(panel=='kfm_file_details_panel')el=kfm_createFileDetailsPanel();
	else if(panel=='kfm_file_upload_panel')el=kfm_createFileUploadPanel();
	else if(panel=='kfm_search_panel')el=kfm_createSearchPanel();
	else if(panel=='kfm_logs_panel'){
		var p=document.createElement('p');
		p.innerHTML=kfm.lang.LoadingKFM;
		el=kfm_createPanel( kfm.lang.Logs, 'kfm_logs_panel', p, {order:100});
	}
	else if(panel=='kfm_widgets_panel')el=kfm_createWidgetsPanel();
	else{
		kfm_log(kfm.lang.NoPanel(panel));
		return;
	}
	if(!wrapper.panels)wrapper.panels=[];
	wrapper.panels[wrapper.panels.length]=panel;
	wrapper.appendChild(el);
}
function kfm_createFileUploadPanel(contentsonly){
	// {{{ create form
	var kfm_uploadPanel_checkForZip=function(e){
		e=new Event(e);
		e.stopPropagation();
		var v=this.value;
		var h=(v.indexOf('.')==-1||v.replace(/.*(\.[^.]*)/,'$1')!='.zip');
		document.getElementById('kfm_unzip1').style.visibility=h?'hidden':'visible';
		document.getElementById('kfm_unzip2').style.visibility=h?'hidden':'visible';
	}
	var sel=newSelectbox('uploadType',[kfm.lang.Upload,kfm.lang.CopyFromURL],0,0,function(){
		var copy=parseInt(this.selectedIndex);
		var unzip1=document.getElementById('kfm_unzip1'),unzip2=document.getElementById('kfm_unzip2'),file=document.getElementById('kfm_file'),url=document.getElementById('kfm_url');
		if(unzip1)unzip1.style.visibility='hidden';
		if(unzip2)unzip2.style.visibility='hidden';
		if(file)file.value='';
		if(url)url.value='';
		document.getElementById('kfm_uploadWrapper').style.display=copy?'none':'block';
		document.getElementById('kfm_copyForm').style.display=copy?'block':'none';
	});
	// {{{ upload from computer
	var wrapper=document.createElement('div');
	wrapper.id='kfm_uploadWrapper';
	// {{{ normal single-file upload form
	var f1=newForm('upload.php','POST','multipart/form-data','kfm_iframe');
	f1.id='kfm_uploadForm';
	var iframe=document.createElement('iframe');
	iframe.id='kfm_iframe';
	iframe.name='kfm_iframe';
	iframe.src='javascript:false';
	iframe.style.display='none';
	var max_upload_size=document.createElement('input');
	max_upload_size.id='MAX_FILE_SIZE';
	max_upload_size.name='MAX_FILE_SIZE';
	max_upload_size.type='hidden';
	max_upload_size.value='9999999999';
	var submit=newInput('upload','submit',kfm.lang.Upload);
	if(!window.ie)$j.event.add(submit,'click',function(e){
		e=new Event(e);
		if(e.rightClick)return;
		setTimeout('document.getElementById("kfm_file").type="text";document.getElementById("kfm_file").type="file"',1);
	});
	var input=newInput('kfm_file','file');
	$j.event.add(input,'keyup',kfm_uploadPanel_checkForZip);
	$j.event.add(input,'change',kfm_uploadPanel_checkForZip);
	var unzip1=document.createElement('span');
	unzip1.id='kfm_unzip1';
	unzip1.className='kfm_unzipWhenUploaded';
	unzip1.style.visibility='hidden';
	kfm.addEl(unzip1,[newInput('kfm_unzipWhenUploaded','checkbox'),kfm.lang.ExtractAfterUpload]);
	kfm.addEl(f1,[input,max_upload_size,submit,unzip1]);
	wrapper.appendChild(f1);
	// }}}
	if(kfm_vars.use_multiple_file_upload){ // load multi-upload thing if possible
		// {{{ form
		var t=document.createElement('table');
		t.id='kfm_uploadFormSwf';
		t.style.display='none';
		var r=t.insertRow(0);
		var c=r.insertCell(0);
		var b1=document.createElement('input');
		b1.type='button';
		b1.value=kfm.lang.Browse;
		c.appendChild(b1);
		c=r.insertCell(1);
		var b2=document.createElement('input');
		b2.id='kfm_fileUploadSWFCancel';
		b2.type='button';
		b2.value=kfm.lang.Cancel;
		b2.disabled='disabled';
		c.appendChild(b2);
		r=t.insertRow(1);
		c=r.insertCell(0);
		c.colSpan=2;
		c.id='kfm_uploadProgress';
		c.innerHTML='&nbsp;';
		wrapper.appendChild(t);
		// }}}
		window.swfUpload=new SWFUpload({
			upload_url:"../../upload.php?swf=1&kfm_session="+window.session_key+"&PHPSESSID="+window.phpsession, // relative to the flash
			upload_cookies:["kfm_session"],
			flash_url : "j/swfupload-2.1.0b2/swfupload_f9.swf",
			file_size_limit : "9999999999",
			file_dialog_complete_handler:function(a){
				document.getElementById('kfm_fileUploadSWFCancel').disabled=null;
				this.kfm_file_at=1;
				this.settings.upload_progress_handler({'size':1},0);
				this.startUpload();
			},
			upload_progress_handler:function(file,bytes_uploaded){
				var percent=Math.ceil((bytes_uploaded/file.size)*100);
				document.getElementById('kfm_uploadProgress').innerHTML='file '+window.swfUpload.kfm_file_at+' :'+percent+'%';
			},
			file_cancelled_handler:function(a){
				document.getElementById('kfm_uploadProgress').innerHTML='&nbsp;';
				document.getElementById('kfm_fileUploadSWFCancel').disabled='disabled';
			},
			upload_success_handler:function(a,sdata){
				++window.swfUpload.kfm_file_at;
				if(sdata!='OK')new Notice("error uploading file:\n\n"+sdata); // TODO: new string
				setTimeout("window.swfUpload.startUpload()",1);
			},
			upload_complete_handler:function(a){
				x_kfm_loadFiles(kfm_cwd_id,kfm_refreshFiles);
				document.getElementById('kfm_uploadProgress').innerHTML='&nbsp;';
				document.getElementById('kfm_fileUploadSWFCancel').disabled='disabled';
			},
			swfupload_pre_load_handler:function(){},
			swfupload_loaded_handler:function(){
				var f=document.getElementById('kfm_uploadForm');
				f.parentNode.removeChild(f);
				document.getElementById('kfm_uploadFormSwf').style.display='block';
			},
			error_handler:function(a){
				alert(a);
			},
			minimum_flash_version : "9.0.28",
			ui_container_id : "kfm_uploadFormSwf",
			degraded_container_id : "kfm_uploadForm",
			debug:false
		});
		$j.event.add(b1,'click',function(e){
			e=new Event(e);
			if(e.rightClick)return;
			window.swfUpload.selectFiles();
		});
		$j.event.add(b2,'click',function(e){
			e=new Event(e);
			if(e.rightClick)return;
			window.swfUpload.cancelUpload();
		});
	}
	// }}}
	// {{{ copy from URL
	var f2=document.createElement('div');
	f2.id='kfm_copyForm';
	f2.style.display='none';
	var submit2=newInput('upload','submit',kfm.lang.CopyFromURL);
	var inp2=newInput('kfm_url',0,0,0,0,'width:100%');
	inp2.onkeyup=kfm_uploadPanel_checkForZip;
	inp2.onchange=kfm_uploadPanel_checkForZip;
	submit2.onclick=kfm_downloadFileFromUrl;
	var unzip2=document.createElement('span');
	unzip2.id='kfm_unzip2';
	unzip2.className='kfm_unzipWhenUploaded';
	unzip2.style.visibility='hidden';
	kfm.addEl(unzip2,[newInput('kfm_unzipWhenUploaded','checkbox'),kfm.lang.ExtractAfterUpload]);
	kfm.addEl(f2,[inp2,submit2,unzip2]);
	// }}}
	// }}}
	var contents=[sel,wrapper,iframe,f2];
	return contentsonly?contents:kfm_createPanel(kfm.lang.FileUpload,'kfm_file_upload_panel',contents,{maxedState:3,state:3,order:2});
}
function kfm_createFileDetailsPanel(){
	return kfm_createPanel(kfm.lang.FileDetails,'kfm_file_details_panel',0,{abilities:1,order:4});
}
function kfm_createPanel(title,id,subels,vars){
	// states:    0=minimised,1=maximised,2=fixed-height, 3=fixed-height-maxed
	// abilities: -1=disabled,0=not closable,1=closable
	// {{{ panel element
	var panelEl=document.createElement('div');
	panelEl.id=id;
	panelEl.className='kfm_panel';
	// {{{ title
	var titleEl=document.createElement('div');
	titleEl.className='kfm_panel_header';
	titleEl.innerHTML=title;
	// }}}
	// {{{ body
	var bodyEl=document.createElement('div');
	bodyEl.className='kfm_panel_body';
	kfm.addEl(bodyEl,subels);
	// }}}
	// }}}
	kfm.addEl(panelEl, [ titleEl,bodyEl ]);
	var el=$extend(
		panelEl,
		{
			state:0,height:0,panel_title:title,abilities:0,visible:1,order:99,
			addCloseButton:function(){if(this.abilities&1)this.addButton('removePanel','','x',kfm.lang.Close)},
			addMaxButton:function(){this.addButton('maximisePanel','','M',kfm.lang.Maximise)},
			addMinButton:function(){this.addButton('minimisePanel','','_',kfm.lang.Minimise)},
			addMoveDownButton:function(){if(this.id!=this.parentNode.panels[this.parentNode.panels.length-1])this.addButton('movePanel',',1','d',kfm.lang.MoveDown)},
			addMoveUpButton:function(){if(this.id!=this.parentNode.panels[0])this.addButton('movePanel',',-1','u',kfm.lang.MoveUp)},
			addRestoreButton:function(){this.addButton('restorePanel','','r',kfm.lang.Restore)},
			addButton:function(f,p,b,t){
				if(this.abilities==-1 || !this.childNodes[0])return;
				this.childNodes[0].appendChild(newLink('javascript:kfm_'+f+'(document.getElementById("'+this.parentNode.id+'"),document.getElementById("'+this.id+'")'+p+')','['+b+']',0,'kfm_panel_header_'+b,t));
			}
		}
	);
	if(vars)el=$extend(el,vars);
	return el;
}
function kfm_createPanelWrapper(name){
	var p=document.createElement('div');
	p.id=name;
	p.className='kfm_panel_wrapper';
	p.panels=[];
	return p;
}
function kfm_createSearchPanel(contentsonly){
	var t,r,inp,rows=0;
	t=document.createElement('table');
	t.id='kfm_search_table';
	{ // filename
		r=t.insertRow(rows++);
		r.insertCell(0).appendChild(newText(kfm.lang.Filename));
		r.insertCell(1).appendChild(kfm_searchBoxFile());
	}
	{ // tags
		r=t.insertRow(rows++);
		r.insertCell(0).appendChild(newText(kfm.lang.Tags));
		inp=newInput('kfm_search_tags');
		inp.title=kfm.lang.CommaSeparated;
		inp.onkeyup=kfm_runSearch;
		r.insertCell(1).appendChild(inp);
	}
	return kfm_createPanel(kfm.lang.Search,'kfm_search_panel',t,{maxedState:3,state:3,order:3});
}
function kfm_createWidgetsPanel(){
	var widgets=[];
	kfm_widgets.each(function(el){
		widgets.push(el.display());
	});
	el=kfm_createPanel('Widgets','kfm_widgets_panel',widgets,{'state':3});
	return el;
}
function kfm_hasPanel(wrapper,panel){
	for(var i=0;i<wrapper.panels.length;++i)if(wrapper.panels[i]==panel)return true;
	return false;
}
function kfm_minimisePanel(wrapper,panel){
	panel.state=0;
	kfm_refreshPanels(wrapper);
}
function kfm_maximisePanel(wrapper,panel){
	panel.state=panel.maxedState==3?3:1;
	kfm_refreshPanels(wrapper);
}
function kfm_movePanel(wrapper,panel,offset){
	var i=0,j,k;
	for(;i<wrapper.panels.length;++i)if(wrapper.panels[i]==panel.id)j=i;
	if(offset<0)--j;
	k=wrapper.panels[j];
	wrapper.panels[j]=wrapper.panels[j+1];
	wrapper.panels[j+1]=k;
	wrapper.insertBefore(document.getElementById(wrapper.panels[j]),document.getElementById(wrapper.panels[j+1]));
	kfm_refreshPanels(wrapper);
}
function kfm_refreshPanels(wrapper){
	if($type(wrapper)=='string')wrapper=document.getElementById(wrapper);
	if(!wrapper)return false;
	var ps=wrapper.panels,i,minheight=0;
	var minimised=[],maximised=[],fixed_height=[],fixed_height_maxed=[];
	for(i=0;i<ps.length;++i){
		var el=document.getElementById(ps[i]);
		if(kfm_inArray(el.id,kfm_hidden_panels))el.visible=false;
		if(el.id=='kfm_file_upload_panel')el.visible=kfm_directories[kfm_cwd_id].writable;
		if(el.visible){
			el.style.display='block';
			el.minheight=el.childNodes[0].offsetHeight;
			minheight+=el.minheight;
			switch(el.state){
				case 0: minimised[minimised.length]=ps[i]; break;
				case 1: maximised[maximised.length]=ps[i]; break;
				case 2: fixed_height[fixed_height.length]=ps[i]; break;
				case 3: fixed_height_maxed[fixed_height_maxed.length]=ps[i]; break;
				default: kfm_log(kfm.lang.UnknownPanelState+el.state);
			}
		}
		else el.style.display='none';
	}
	var height=wrapper.offsetHeight;
	for(i=0;i<minimised.length;++i){
		var n=minimised[i];
		var el=document.getElementById(n);
		el.childNodes[1].style.display='none';
		var head=el.childNodes[0],els=[];
		head.innerHTML='';
		if(wrapper.panels_unlocked){
			el.addCloseButton();
			el.addMaxButton();
			el.addMoveDownButton();
			el.addMoveUpButton();
		}
		els[els.length]=el.panel_title;
		kfm.addEl(head,els);
	}
	for(i=0;i<fixed_height.length;++i){
		var n=fixed_height[i];
		var el=document.getElementById(n);
		el.childNodes[1].style.height=el.height+'px';
		el.childNodes[1].style.display='block';
		minheight+=el.height;
		var head=el.childNodes[0],els=[];
		head.innerHTML='';
		if(wrapper.panels_unlocked){
			el.addCloseButton();
			el.addMaxButton();
			el.addMinButton();
			el.addMoveDownButton();
			el.addMoveUpButton();
		}
		els[els.length]=el.panel_title;
		kfm.addEl(head,els);
	}
	minheight=kfm_panels_drawFixedHeightMaxed(fixed_height_maxed,wrapper,minheight);
	kfm_panels_drawMaximised(maximised,height,minheight,wrapper);
	kfm_panels_fixOrder(wrapper);
}
function kfm_panels_drawFixedHeightMaxed(fixed_height_maxed,wrapper,minheight){
	if(!fixed_height_maxed.length)return minheight;
	var n,el,body,head,i;
	for(i=0;i<fixed_height_maxed.length;++i){
		n=fixed_height_maxed[i];
		el=document.getElementById(n);
		body=el.childNodes[1];
		body.style.height='auto';
		body.style.display='block';
		minheight+=body.offsetHeight;
		head=el.childNodes[0];
		head.innerHTML='';
		if(wrapper.panels_unlocked){
			el.addCloseButton();
			el.addMinButton();
			el.addMoveDownButton();
			el.addMoveUpButton();
		}
		kfm.addEl(head,el.panel_title);
	}
	return minheight;
}
function kfm_panels_drawMaximised(maximised,height,minheight,wrapper){
	if(!maximised.length)return;
	var size,n,el,head,i;
	size=(height-minheight)/maximised.length;
	for(i=0;i<maximised.length;++i){
		n=maximised[i];
		el=document.getElementById(n);
		el.childNodes[1].style.height=size+'px';
		el.childNodes[1].style.display='block';
		head=el.childNodes[0];
		head.innerHTML='';
		if(wrapper.panels_unlocked){
			el.addCloseButton();
			el.addRestoreButton();
			el.addMinButton();
			el.addMoveDownButton();
			el.addMoveUpButton();
		}
		kfm.addEl(head,el.panel_title);
	}
}
function kfm_panels_fixOrder(wrapper){
	var i,els,found,prev,order;
	do{
		els=wrapper.childNodes;
		found=0;
		prev=0;
		for(i=0;i<els.length,!found,els[i];++i){
			order=els[i].order;
			if(order<prev&&i){
				wrapper.insertBefore(els[i],els[i-1]);
				found=1;
			}
			prev=order;
		}
	}while(found);
}
function kfm_removePanel(wrapper,panel){
	if(!panel)return;
	panel.visible=0;
	kfm_refreshPanels(wrapper);
}
function kfm_restorePanel(wrapper,panel){
	panel.state=2;
	if(!panel.height)panel.height=panel.childNodes[1].offsetHeight;
	kfm_refreshPanels(wrapper);
}
function kfm_togglePanelsUnlocked(){
	var el=document.getElementById('kfm_left_column');
	el.panels_unlocked=1-el.panels_unlocked;
	kfm_refreshPanels('kfm_left_column');
}
