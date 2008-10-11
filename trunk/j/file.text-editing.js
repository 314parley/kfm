// see ../license.txt for licensing
function kfm_createEmptyFile(filename,msg){
	if(!filename || filename.toString()!==filename){
		filename='';
		msg='';
	}
	var not_ok=0;
	kfm_prompt(kfm.lang.WhatFilenameToCreateAs+msg,filename,function(filename){
		if(!filename)return;
		if(kfm_isFileInCWD(filename)){
			var o=kfm.confirm(kfm.lang.AskIfOverwrite(filename));
			if(!o)not_ok=1;
		}
		if(filename.indexOf('/')>-1){
			msg=kfm.lang.NoForwardslash;
			not_ok=1;
		}
		if(not_ok)return kfm_createEmptyFile(filename,msg);
		x_kfm_createEmptyFile(kfm_cwd_id,filename,kfm_refreshFiles);
	});
}
function kfm_leftColumn_disable(){
	var left_column=document.getElementById('kfm_left_column');
	var left_column_hider=document.createElement('div');
	left_column.id='kfm_left_column_hider';
	left_column_hider.style.position='absolute';
	left_column_hider.style.left      =0;
	left_column_hider.style.top       =0;
	left_column_hider.style.width     =left_column.offsetWidth+'px';
	left_column_hider.style.height    =left_column.offsetHeight+'px';
	left_column_hider.style.opacity   ='.7';
	left_column_hider.style.background='#fff';
	document.body.appendChild(left_column_hider);
	kfm_resizeHandler_addMaxHeight('kfm_left_column_hider');
}
function kfm_leftColumn_enable(){
	var hider=document.getElementById("kfm_left_column_hider");
	if(!hider)return;
	hider.parentNode.removeChild(hider);
	kfm_resizeHandler_removeMaxHeight('kfm_left_column_hider');
}
function kfm_textfile_attachKeyBinding(){
	if(!codepress.editor||!codepress.editor.body)return setTimeout('kfm_textfile_attachKeyBinding();',1);
	var doc=codepress.contentWindow.document;
	if(doc.attachEvent)doc.attachEvent('onkeypress',kfm_textfile_keybinding);
	else doc.addEventListener('keypress',kfm_textfile_keybinding,false);
}
function kfm_textfile_close(){
	if(document.getElementById("edit-start").value!=codepress.getCode() && !kfm.confirm( kfm.lang.CloseWithoutSavingQuestion))return;
	kfm_leftColumn_enable();
	kfm_changeDirectory("kfm_directory_icon_"+kfm_cwd_id);
	$j.event.remove(document.getElementById('kfm_right_column'),'keyup',kfm_textfile_keybinding);
}
function kfm_textfile_createEditor(){
	CodePress.run();
	var tip=document.getElementById('kfm_tooltip');
	if(tip)tip.parentNode.removeChild(tip);
	kfm_textfile_attachKeyBinding();
}
function kfm_textfile_initEditor(res,readonly){
	if(!document.getElementById('kfm_left_column_hider'))kfm_leftColumn_disable();
	var t=document.createElement('table');
	t.id='kfm_editFileTable';
	t.style.width='100%';
	var right_column=document.getElementById('kfm_right_column');
	right_column.innerHTML='';
	$j.event.add(right_column,'keyup',kfm_textfile_keybinding);
	right_column.contentMode='codepress';
	right_column.appendChild(t);
	var r2=kfm.addRow(t),c=0;
	kfm.addCell(r2,c++,1,res.name);
	if(!readonly){ /* show option to save edits */
		kfm.addCell(r2,c++,1,newLink('javascript:new Notice("saving file...");document.getElementById("edit-start").value=codepress.getCode();x_kfm_saveTextFile('+res.id+',document.getElementById("edit-start").value,kfm_showMessage);','Save',0,'button'));
	}
	kfm.addCell(r2,c++,1,newLink('javascript:kfm_textfile_close()',kfm.lang.Close,0,'button'));
	var row=kfm.addRow(t);
	r3=kfm.addCell(row,0,c);
	r3.id='kfm_codepressTableCell';
	var className='codepress '+res.language+(readonly?' readonly-on':'');
	var h=$(window).height()-t.offsetHeight-2;
	if(window.ie)h-=13;
	var codeEl=document.createElement('textarea');
	codeEl.id          ='codepress';
	codeEl.classname   =className,
	codeEl.value       =res.content,
	codeEl.title       =res.name;
	codeEl.style.width =(t.offsetWidth-25)+'px';
	codeEl.style.height=h+'px';
	changeCheckEl=newInput('edit-start','textarea',res.content);
	changeCheckEl.style.display='none';
	r3.appendChild(codeEl);
	r3.appendChild(changeCheckEl);
	if(window.CodePress)kfm_textfile_createEditor();
	else loadJS('j/codepress-0.9.6/codepress.js','cp-script','en-us','kfm_textfile_createEditor();');
}
function kfm_textfile_keybinding(e){
	e=new Event(e);
	if(e.code!=27)return;
	e.stopPropagation();
	kfm_textfile_close();
}
