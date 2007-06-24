// see license.txt for licensing
function kfm_closeContextMenu(){
	if(contextmenu)contextmenu.remove();
	contextmenu=null;
}
function kfm_contextmenuinit(){
	addEvent(getWindow(),'click',function(e){
		if(!contextmenu)return;
		var c=contextmenu,m=getMouseAt(e);
		var l=c.offsetLeft,t=c.offsetTop;
		if(m.x<l||m.x>l+c.offsetWidth||m.y<t||m.y>t+c.offsetHeight)kfm_closeContextMenu();
	});
	getWindow().oncontextmenu=function(e){
		e=getEvent(e);
		kfm_cancelEvent(e,1);
	}
}
function kfm_createContextMenu(m,links){
	if(!window.contextmenu_loading)kfm_closeContextMenu();
	if(!contextmenu){
		window.contextmenu=newEl('table',0,'contextmenu',0,{
			addLink:function(href,text,icon,disabled){
				if(disabled && !kfm_vars.show_disabled_contextmenu_links)return;
				var row=kfm_addRow(this);
				if(disabled){
					row.className+=' disabled';
					href='';
				}
				var link=(href!='kfm_0')?newLink('javascript:kfm_closeContextMenu();'+href,text):text;
				kfm_addCell(row,0,0,(icon?new Element('img',{src:'themes/'+kfm_theme+'/icons/'+icon+'.png'}):''),'kfm_contextmenu_iconCell');
				kfm_addCell(row,1,0,link);
			}
		},'left:'+m.x+'px;top:'+m.y+'px');
		window.contextmenu_loading=setTimeout('window.contextmenu_loading=null',1);
		kfm_addEl(document.body,contextmenu);
	}
	else{
		var col=kfm_addCell(kfm_addRow(contextmenu));
		col.colSpan=2;
		kfm_addEl(col,newEl('hr'));
	}
	var rows=contextmenu.rows.length;
	for(var i=0;i<links.length;++i)if(links[i][1])contextmenu.addLink(links[i][0],links[i][1],links[i][2],links[i][3]);
	var w=contextmenu.offsetWidth,h=contextmenu.offsetHeight,ws=getWindowSize();
	if(h+m.y>ws.y)contextmenu.style.top=(ws.y-h)+'px';
	if(w+m.x>ws.x)contextmenu.style.left=(m.x-w)+'px';
}
